
# WhatsApp Music Bot

A WhatsApp bot that converts YouTube videos to audio and sends them as voice messages to a channel.

## Features

- Download audio from YouTube videos
- Convert to WhatsApp-compatible voice message format
- Send to specified WhatsApp channel with a single command

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Install FFmpeg on your system
4. Update `config/config.json` with your channel JID
5. Run the bot: `npm start`
6. Scan the QR code with WhatsApp to authenticate

## Usage

Send a message to the bot in this format:
`.csong <youtube_url>`

The bot will download the audio and send it as a voice message to your channel.

## Requirements

- Node.js
- FFmpeg
- WhatsApp account
