const express = require('express');
const cors = require('cors');
const path = require('path');
const PhoneAuth = require('./phoneAuth');
const { getConfig } = require('./utils');

let phoneAuthInstance = null;

function startWebServer(sock, config) {
    const app = express();
    const port = process.env.PORT || config.webServer?.port || 3000;
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.static('public'));
    
    // Initialize phone authentication
    phoneAuthInstance = new PhoneAuth(sock);
    
    // Routes
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    // Health check endpoint for Railway
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'OK', 
            service: 'WhatsApp Bot',
            timestamp: new Date().toISOString()
        });
    });
    
    // Phone authentication API
    app.post('/api/phone-auth/request', async (req, res) => {
        try {
            const { phoneNumber } = req.body;
            
            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone number is required'
                });
            }
            
            const result = await phoneAuthInstance.sendVerificationCode(phoneNumber);
            res.json({
                success: true,
                ...result
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    app.post('/api/phone-auth/verify', async (req, res) => {
        try {
            const { verificationId, code } = req.body;
            
            if (!verificationId || !code) {
                return res.status(400).json({
                    success: false,
                    error: 'Verification ID and code are required'
                });
            }
            
            const result = await phoneAuthInstance.verifyCode(verificationId, code);
            res.json({
                success: true,
                ...result
            });
            
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });
    
    app.get('/api/status', (req, res) => {
        res.json({
            success: true,
            phoneAuthEnabled: phoneAuthInstance.enabled,
            server: 'WhatsApp Bot Phone Auth API',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        });
    });
    
    // Start server
    app.listen(port, '0.0.0.0', () => {
        console.log(`🌐 Phone authentication server running on port ${port}`);
        console.log(`🔗 Web Interface: https://your-app-name.railway.app`);
    });
    
    return app;
}

module.exports = { startWebServer };
