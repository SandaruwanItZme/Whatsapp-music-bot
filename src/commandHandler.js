const { downloadAndConvertAudio } = require('./audioHandler');
const { isValidYouTubeUrl, extractVideoId } = require('./utils');

async function handleIncomingMessage(m, sock, config) {
    const message = m.messages[0];
    if (!message.message || message.key.remoteJid === 'status@broadcast') return;
    
    const text = message.message.conversation || 
                (message.message.extendedTextMessage && message.message.extendedTextMessage.text) || '';
    
    const prefix = config.whatsapp.prefix || '.';
    
    if (text.startsWith(prefix)) {
        const commandText = text.slice(prefix.length).trim();
        const [commandName, ...args] = commandText.split(' ');
        const fullArgs = args.join(' ');
        
        if (commandName === 'csong' && fullArgs) {
            await handleCsongCommand(fullArgs, message, sock, config);
        } else if (commandName === 'help') {
            await handleHelpCommand(message, sock, config);
        } else if (commandName === 'phoneauth') { // NEW COMMAND
            await handlePhoneAuthCommand(fullArgs, message, sock, config);
        }
    }
}

// NEW: Phone authentication command
async function handlePhoneAuthCommand(args, message, sock, config) {
    const [subCommand, ...params] = args.split(' ');
    
    if (subCommand === 'status') {
        const status = config.phoneAuth?.enabled ? 'enabled' : 'disabled';
        await sendMessage(sock, message.key.remoteJid, 
            `📱 Phone Authentication Status: ${status}\n` +
            `🌐 Web Server: http://localhost:${config.webServer?.port || 3000}`
        );
    } else {
        await sendMessage(sock, message.key.remoteJid, 
            `📱 Phone Authentication Commands:\n` +
            `${config.whatsapp.prefix}phoneauth status - Check status\n` +
            `🌐 Visit http://localhost:${config.webServer?.port || 3000} for web interface`
        );
    }
}

async function handleCsongCommand(args, message, sock, config) {
    const url = args.trim();
    const prefix = config.whatsapp.prefix || '.';
    
    if (!url) {
        await sendMessage(sock, message.key.remoteJid, `❌ Please provide a YouTube URL. Usage: ${prefix}csong <youtube_url>`);
        return;
    }
    
    if (!isValidYouTubeUrl(url)) {
        await sendMessage(sock, message.key.remoteJid, '❌ Invalid YouTube URL. Please provide a valid YouTube link.');
        return;
    }
    
    console.log(`Processing YouTube URL: ${url}`);
    
    try {
        await sendMessage(sock, message.key.remoteJid, '⏳ Downloading and converting audio...');
        
        const audioPath = await downloadAndConvertAudio(url);
        const channelJid = config.whatsapp.channelJid;
        
        if (!channelJid || channelJid === 'your_channel_jid_here@broadcast') {
            throw new Error('Channel JID not configured. Please update config.json with your channel JID.');
        }
        
        await sendVoiceMessage(channelJid, audioPath, sock);
        
        const videoId = extractVideoId(url);
        const youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        
        await sendMessage(sock, message.key.remoteJid, {
            text: '✅ Audio sent to channel!',
            contextInfo: {
                externalAdReply: {
                    title: 'YouTube Audio',
                    body: 'Successfully sent to channel',
                    thumbnailUrl: youtubeThumbnail,
                    sourceUrl: url,
                    mediaType: 1
                }
            }
        });
        
        const fs = require('fs');
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }
        
    } catch (error) {
        console.error('Error processing audio:', error);
        await sendMessage(sock, message.key.remoteJid, `❌ Error processing audio: ${error.message}`);
    }
}

async function handleHelpCommand(message, sock, config) {
    const prefix = config.whatsapp.prefix || '.';
    const helpText = `🎵 *WhatsApp Music Bot Commands* 🎵\n\n
*${prefix}csong <url>* - Convert YouTube video to audio and send to channel
*${prefix}phoneauth* - Phone authentication commands
*${prefix}help* - Show this help message

*Example:*
${prefix}csong https://www.youtube.com/watch?v=dQw4w9WgXcQ

*Phone Authentication:*
Visit http://localhost:${config.webServer?.port || 3000} to authenticate with phone number`;

    await sendMessage(sock, message.key.remoteJid, helpText);
}

async function sendVoiceMessage(jid, audioPath, sock) {
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(audioPath);
    
    await sock.sendMessage(jid, {
        audio: audioBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
    });
}

async function sendMessage(sock, jid, content) {
    if (typeof content === 'string') {
        await sock.sendMessage(jid, { text: content });
    } else {
        await sock.sendMessage(jid, content);
    }
}

module.exports = { handleIncomingMessage };
