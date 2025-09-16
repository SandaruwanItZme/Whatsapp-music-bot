// src/utils.js

const fs = require('fs');
const path = require('path');

/**
 * Validate if a string is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}

/**
 * Generate a unique filename for audio files
 * @param {string} url - YouTube URL
 * @returns {string} - Unique filename
 */
function generateAudioFilename(url) {
    const videoId = new URL(url).searchParams.get('v');
    const timestamp = Date.now();
    return `${videoId}_${timestamp}.ogg`;
}

/**
 * Clean up temporary files older than 1 hour
 */
function cleanupTempFiles() {
    const tempDir = path.join(__dirname, '..', 'temp');
    
    if (!fs.existsSync(tempDir)) {
        return;
    }
    
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > oneHour) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up temporary file: ${file}`);
        }
    });
}

/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
    } catch (error) {
        return null;
    }
}

module.exports = {
    isValidYouTubeUrl,
    generateAudioFilename,
    cleanupTempFiles,
    formatDuration,
    extractVideoId
};
