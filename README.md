# Roblox API Proxy

A simple Node.js proxy server to fetch Roblox friends, followers, and followings by username.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the server:
   ```bash
   npm start
   ```
3. Endpoint:
   - POST `/lookup`
     ```json
     {
       "username": "roblox",
       "type": "friends"
     }
     ```
