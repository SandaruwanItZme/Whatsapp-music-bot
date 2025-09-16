const fs = require('fs');
const path = require('path');

// Config management
let config = null;

/**
 * Load configuration from config.json
 * @returns {Object} Configuration object
 */
function loadConfig() {
    try {
        const configPath = path.join(__dirname, '..', 'config', 'config.json');
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(configData);
            console.log('Configuration loaded successfully');
        } else {
            console.warn('Config file not found, using default configuration');
            config = getDefaultConfig();
        }
        return config;
    } catch (error) {
        console.error('Error loading config:', error);
        return getDefaultConfig();
    }
}

/**
 * Get default configuration
 * @returns {Object} Default configuration
 */
function getDefaultConfig() {
    return {
        whatsapp: {
            channelJid: process.env.CHANNEL_JID || "your_channel_jid_here@broadcast",
            prefix: process.env.PREFIX || ".",
            maxAudioDuration: parseInt(process.env.MAX_AUDIO_DURATION) || 300,
            reconnectTimeout: 5000,
            qrTimeout: 60000,
            connectionCheckInterval: 30000
        },
        youtube: {
            maxRetries: 3,
            requestTimeout: 30000,
            highWaterMark: 33554432,
            quality: "highestaudio"
        },
        audio: {
            format: "ogg",
            codec: "libopus",
            sampleRate: 48000,
            channels: 1,
            bitrate: "96k",
            maxFileSizeMB: 16
        },
        paths: {
            auth: "./auth_info",
            temp: "./temp",
            logs: "./logs"
        }
    };
}

/**
 * Get config value by path
 * @param {string} path - Config path (e.g., 'whatsapp.prefix')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Config value
 */
function getConfig(path, defaultValue = null) {
    if (!config) {
        loadConfig();
    }
    
    const parts = path.split('.');
    let value = config;
    
    for (const part of parts) {
        if (value && value[part] !== undefined) {
            value = value[part];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

/**
 * Update config value
 * @param {string} path - Config path
 * @param {*} value - New value
 * @returns {boolean} Success status
 */
function updateConfig(path, value) {
    try {
        const parts = path.split('.');
        let current = config;
        
        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] === undefined) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
        
        // Save to file
        const configPath = path.join(__dirname, '..', 'config', 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        return true;
    } catch (error) {
        console.error('Error updating config:', error);
        return false;
    }
}
