require('dotenv').config();
const { connectToWhatsApp } = require('./whatsappClient');
const { handleIncomingMessage } = require('./commandHandler');
const { loadConfig } = require('./utils');

// Load configuration
const config = loadConfig();

// Start the bot
async function startBot() {
    try {
        console.log('Starting WhatsApp Music Bot...');
        console.log(`Prefix: ${config.whatsapp.prefix}`);
        console.log(`Channel JID: ${config.whatsapp.channelJid}`);
        
        const sock = await connectToWhatsApp();
        
        // Set up message handler
        sock.ev.on('messages.upsert', async (m) => {
            await handleIncomingMessage(m, sock, config);
        });
        
        console.log('WhatsApp Music Bot is running...');
        console.log('Use Ctrl+C to stop the bot');
        
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down WhatsApp Music Bot...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Shutting down...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startBot();
