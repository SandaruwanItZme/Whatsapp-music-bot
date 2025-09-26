require('dotenv').config();
const { connectToWhatsApp } = require('./whatsappClient');
const { handleIncomingMessage } = require('./commandHandler');
const { loadConfig } = require('./utils');
const { startWebServer } = require('./webServer'); // NEW

// Load configuration
const config = loadConfig();

// Start the bot
async function startBot() {
    try {
        console.log('Starting WhatsApp Music Bot...');
        
        // Connect to WhatsApp
        const sock = await connectToWhatsApp();
        
        // Start web server for phone authentication
        if (config.webServer && config.webServer.enable) {
            startWebServer(sock, config);
        }
        
        // Set up message handler
        sock.ev.on('messages.upsert', async (m) => {
            await handleIncomingMessage(m, sock, config);
        });
        
        console.log('WhatsApp Music Bot is running...');
        console.log('Phone authentication server: http://localhost:' + (config.webServer?.port || 3000));
        
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

startBot();
