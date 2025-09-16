
const { downloadAndConvertAudio } = require('./audioHandler');

const PREFIX = process.env.PREFIX || '.';

async function handleIncomingMessage(m, sock) {
    const message = m.messages[0];
    if (!message.message || message.key.remoteJid === 'status@broadcast') return;
    
    const text = message.message.conversation || 
                (message.message.extendedTextMessage && message.message.extendedTextMessage.text) || '';
    
    if (text.startsWith(PREFIX)) {
        const command = text.slice(PREFIX.length).trim().split(' ')[0].toLowerCase();
        const args = text.slice(PREFIX.length + command.length).trim();
        
        if (command === 'csong' && args) {
            await handleCsongCommand(args, message, sock);
        } else if (command === 'help' || command === 'commands') {
            await handleHelpCommand(message, sock);
        }
    }
}

async function handleCsongCommand(url, message, sock) {
    console.log(`Processing YouTube URL: ${url}`);
    try {
        // Send processing message
        await sock.sendMessage(message.key.remoteJid, { text: '⏳ Downloading and converting audio...' });
        
        // Download and convert audio
        const audioPath = await downloadAndConvertAudio(url);
        
        // Send as voice message to channel
        await sendVoiceMessage(process.env.CHANNEL_JID, audioPath, sock);
        
        // Confirm success
        await sock.sendMessage(message.key.remoteJid, { text: '✅ Audio sent to channel!' });
        
        // Clean up
        const fs = require('fs');
        fs.unlinkSync(audioPath);
    } catch (error) {
        console.error('Error processing audio:', error);
        await sock.sendMessage(message.key.remoteJid, { text: '❌ Error processing audio: ' + error.message });
    }
}

async function handleHelpCommand(message, sock) {
    const helpText = `🎵 WhatsApp Music Bot Commands:
    
${process.env.PREFIX || '.'}csong <youtube_url> - Convert YouTube video to audio and send to channel
${process.env.PREFIX || '.'}help - Show this help message

Example:
${process.env.PREFIX || '.'}csong https://www.youtube.com/watch?v=dQw4w9WgXcQ`;

    await sock.sendMessage(message.key.remoteJid, { text: helpText });
}

async function sendVoiceMessage(jid, audioPath, sock) {
    const fs = require('fs');
    const audioBuffer = fs.readFileSync(audioPath);
    
    await sock.sendMessage(jid, {
        audio: audioBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true, // This marks it as a voice message
    });
}

module.exports = { handleIncomingMessage };
