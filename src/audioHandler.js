
// src/audioHandler.js

const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { isValidYouTubeUrl, generateAudioFilename } = require('./utils');

// Maximum audio duration in seconds (5 minutes default)
const MAX_DURATION = parseInt(process.env.MAX_AUDIO_DURATION) || 300;

/**
 * Download and convert YouTube audio to WhatsApp-compatible format
 * @param {string} url - YouTube URL
 * @returns {Promise<string>} - Path to the converted audio file
 */
async function downloadAndConvertAudio(url) {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate YouTube URL
            if (!isValidYouTubeUrl(url)) {
                reject(new Error('Invalid YouTube URL'));
                return;
            }

            // Get video info to check duration
            const info = await ytdl.getInfo(url);
            const videoDetails = info.videoDetails;
            const duration = parseInt(videoDetails.lengthSeconds);

            // Check if video is too long
            if (duration > MAX_DURATION) {
                reject(new Error(`Video is too long. Maximum allowed duration is ${MAX_DURATION} seconds (${Math.floor(MAX_DURATION/60)} minutes). This video is ${duration} seconds long.`));
                return;
            }

            const filename = generateAudioFilename(url);
            const outputPath = path.join(__dirname, '..', 'temp', filename);

            console.log(`Downloading audio from: ${url}`);
            console.log(`Video title: ${videoDetails.title}`);
            console.log(`Duration: ${duration} seconds`);

            // Download audio with highest quality
            const audioStream = ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25 // 32MB buffer
            });

            // FFmpeg command to convert to OGG/Opus format (WhatsApp compatible)
            const ffmpegCommand = `ffmpeg -i pipe:0 -c:a libopus -ar 48000 -ac 1 -b:a 96k -v warning -y "${outputPath}"`;
            
            const ffmpeg = exec(ffmpegCommand, (error) => {
                if (error) {
                    reject(new Error(`FFmpeg error: ${error.message}`));
                }
            });

            // Handle FFmpeg events
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log(`Audio converted successfully: ${outputPath}`);
                    
                    // Verify the file was created
                    if (fs.existsSync(outputPath)) {
                        const stats = fs.statSync(outputPath);
                        if (stats.size > 0) {
                            resolve(outputPath);
                        } else {
                            reject(new Error('Converted audio file is empty'));
                        }
                    } else {
                        reject(new Error('Converted audio file was not created'));
                    }
                } else {
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            ffmpeg.on('error', (err) => {
                reject(new Error(`FFmpeg execution error: ${err.message}`));
            });

            // Pipe audio stream to FFmpeg
            audioStream.pipe(ffmpeg.stdin);

            // Handle stream errors
            audioStream.on('error', (err) => {
                reject(new Error(`YouTube download error: ${err.message}`));
            });

            ffmpeg.stdin.on('error', (err) => {
                // Ignore EPIPE errors which can happen when FFmpeg closes early
                if (err.code !== 'EPIPE') {
                    reject(new Error(`FFmpeg stdin error: ${err.message}`));
                }
            });

            // Progress tracking (optional)
            let downloadedBytes = 0;
            audioStream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                console.log(`Downloaded: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
            });

        } catch (error) {
            reject(new Error(`Failed to process audio: ${error.message}`));
        }
    });
}

/**
 * Alternative method using ytdl-core's built-in support for different formats
 * @param {string} url - YouTube URL
 * @returns {Promise<string>} - Path to the audio file
 */
async function downloadAudioAlternative(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const info = await ytdl.getInfo(url);
            const videoDetails = info.videoDetails;
            const duration = parseInt(videoDetails.lengthSeconds);

            if (duration > MAX_DURATION) {
                reject(new Error(`Video is too long. Maximum allowed duration is ${MAX_DURATION} seconds.`));
                return;
            }

            const filename = generateAudioFilename(url);
            const outputPath = path.join(__dirname, '..', 'temp', filename);

            // Try to find the best audio format
            const format = ytdl.chooseFormat(info.formats, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            if (!format) {
                reject(new Error('No suitable audio format found'));
                return;
            }

            console.log(`Using audio format: ${format.audioBitrate}kbps ${format.container}`);

            const audioStream = ytdl.downloadFromInfo(info, { format });

            // If it's already in a compatible format, just save it
            if (format.container === 'ogg' || format.container === 'webm') {
                const fileStream = fs.createWriteStream(outputPath);
                audioStream.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    resolve(outputPath);
                });
                
                fileStream.on('error', (err) => {
                    reject(new Error(`File write error: ${err.message}`));
                });
            } else {
                // Convert to OGG using FFmpeg
                const ffmpeg = exec(`ffmpeg -i pipe:0 -c:a libopus -ar 48000 -ac 1 -b:a 96k -y "${outputPath}"`);
                
                audioStream.pipe(ffmpeg.stdin);
                
                ffmpeg.on('close', (code) => {
                    if (code === 0) {
                        resolve(outputPath);
                    } else {
                        reject(new Error(`FFmpeg conversion failed with code ${code}`));
                    }
                });
                
                ffmpeg.on('error', (err) => {
                    reject(new Error(`FFmpeg error: ${err.message}`));
                });
            }

            audioStream.on('error', (err) => {
                reject(new Error(`Download error: ${err.message}`));
            });

        } catch (error) {
            reject(new Error(`Audio download failed: ${error.message}`));
        }
    });
}

/**
 * Get video information without downloading
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Video information
 */
async function getVideoInfo(url) {
    try {
        if (!isValidYouTubeUrl(url)) {
            throw new Error('Invalid YouTube URL');
        }

        const info = await ytdl.getInfo(url);
        return {
            title: info.videoDetails.title,
            duration: parseInt(info.videoDetails.lengthSeconds),
            thumbnail: info.videoDetails.thumbnails[0].url,
            author: info.videoDetails.author.name,
            viewCount: info.videoDetails.viewCount
        };
    } catch (error) {
        throw new Error(`Failed to get video info: ${error.message}`);
    }
}

/**
 * Check if FFmpeg is available on the system
 * @returns {Promise<boolean>} - True if FFmpeg is available
 */
async function checkFFmpeg() {
    return new Promise((resolve) => {
        exec('ffmpeg -version', (error) => {
            resolve(!error);
        });
    });
}

module.exports = {
    downloadAndConvertAudio,
    downloadAudioAlternative,
    getVideoInfo,
    checkFFmpeg,
    MAX_DURATION
};
