# WhatsApp Music Bot

A WhatsApp bot that converts YouTube videos to audio and sends them as voice messages to a channel.

## Features

- Download audio from YouTube videos
- Convert to WhatsApp-compatible voice message format
- Send to specified WhatsApp channel with a single command
- Simple command interface with prefix support
- Secure code verification
- Send verification codes via WhatsApp

## Phone Number Authentication

The bot now supports phone number authentication via a web interface.

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Install FFmpeg on your system
4. Copy environment file: `cp .env.example .env`
5. Edit `.env` file and add your channel JID: `CHANNEL_JID=your_channel_jid@broadcast`
6. Run the bot: `npm start`
7. Scan the QR code with WhatsApp to authenticate

## Usage

Send a message to the bot in this format:
`.csong <youtube_url>`

The bot will download the audio and send it as a voice message to your channel.
1. Start the bot: `npm start`
2. Visit: `http://localhost:3000`
3. Enter your WhatsApp number
4. Receive verification code via WhatsApp
5. Enter the code on the web interface

### API Endpoints:
- `POST /api/phone-auth/request` - Request verification code
- `POST /api/phone-auth/verify` - Verify code

### WhatsApp Command:
- `.phoneauth status` - Check authentication status
## Requirements

- Node.js 16+
- FFmpeg installed and available in PATH
- WhatsApp account

## Configuration

Edit the `.env` file to customize:
- `CHANNEL_JID`: Your WhatsApp channel JID
- `PREFIX`: Command prefix (default: ".")
- `NODE_ENV`: Environment (development/production)

## Notes

- The first run will require you to scan a QR code to link your WhatsApp account
- Audio conversion might take time depending on video length
- Make sure your bot account has permission to send messages in the channel
## Configuration

The bot uses a `config/config.json` file for configuration. Here's what each setting does:

### WhatsApp Settings
- `channelJid`: Your WhatsApp channel JID (e.g., `1234567890@broadcast`)
- `prefix`: Command prefix (default: ".")
- `maxAudioDuration`: Maximum audio duration in seconds (default: 300 = 5 minutes)

### YouTube Settings
- `maxRetries`: Maximum download retry attempts
- `requestTimeout`: Request timeout in milliseconds
- `quality`: Audio quality preference

### Audio Settings
- `format`: Output audio format
- `codec`: Audio codec
- `sampleRate`: Sample rate in Hz
- `channels`: Number of audio channels
- `bitrate`: Audio bitrate

### Path Settings
- `auth`: Authentication data directory
- `temp`: Temporary files directory
- `logs`: Log files directory

### Editing Configuration
1. Open `config/config.json`
2. Update the values as needed
3. Restart the bot for changes to take effect

### Environment Variables
You can also use environment variables (which override config.json):
- `CHANNEL_JID`: Your WhatsApp channel JID
- `PREFIX`: Command prefix
- `MAX_AUDIO_DURATION`: Maximum audio duration
