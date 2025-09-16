
require('dotenv').config();
const { connectToWhatsApp } = require('./whatsappClient');
const { handleIncomingMessage } = require('./commandHandler');

// Start the bot
async function startBot() {
    try {
        const sock = await connectToWhatsApp();
        
        // Set up message handler
        sock.ev.on('messages.upsert', async (m) => {
            await handleIncomingMessage(m, sock);
        });
        
        console.log('WhatsApp Music Bot is running...');
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down WhatsApp Music Bot...');
    process.exit(0);
});

startBot();
