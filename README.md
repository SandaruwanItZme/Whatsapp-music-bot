# WhatsApp Music Bot

A WhatsApp bot that converts YouTube videos to audio and sends them as voice messages to a channel.

## Features

- Download audio from YouTube videos
- Convert to WhatsApp-compatible voice message format
- Send to specified WhatsApp channel with a single command
- Simple command interface with prefix support

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
