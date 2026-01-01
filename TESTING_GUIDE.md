# Testing Shared Servers Locally

## Method 1: Multiple Browser Windows (Easiest)

### Steps:
1. **Start your dev server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000` or `http://localhost:3001`

2. **User A (Creator):**
   - Open `http://localhost:3000` in Chrome (or your main browser)
   - Sign in with Gmail Account A
   - Create a server (e.g., "Test Server")
   - Go to Group tab
   - Enter User B's email and click "Send Invite"
   - Copy the invite link from the console or email

3. **User B (Joiner):**
   - Open `http://localhost:3000` in an **Incognito/Private window** (or different browser like Firefox)
   - Paste the invite link
   - Sign in with Gmail Account B
   - Should automatically join the server

4. **Test Real-time Collaboration:**
   - Keep both windows open side-by-side
   - User A adds a debt → User B should see it appear instantly
   - User B adds a debt → User A should see it appear instantly

## Method 2: Using Localhost Tunnel (For Testing on Different Devices)

### Option A: Using ngrok (Recommended)

1. **Install ngrok:**
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com/
   ```

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **Create tunnel:**
   ```bash
   ngrok http 3000
   ```
   This gives you a public URL like: `https://abc123.ngrok.io`

4. **Update invite links to use ngrok URL:**
   - Temporarily change `src/pages/index.tsx` line 332:
   ```javascript
   const inviteLink = `https://YOUR-NGROK-URL.ngrok.io/join?email=...`;
   ```

5. **Test from any device:**
   - Send invite with ngrok URL
   - Open link on phone/tablet/another computer
   - Test real-time collaboration across devices

### Option B: Using localtunnel (Free Alternative)

1. **Install localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel:**
   ```bash
   lt --port 3000
   ```
   This gives you a URL like: `https://random-name.loca.lt`

3. **Update invite links** to use the localtunnel URL

## Method 3: Manual Testing Without Email

You can manually construct invite links:

1. **Get Server ID:**
   - Open browser console on your app
   - Look for server ID in the servers list
   - Or check Firestore console: https://console.firebase.google.com/project/squareup-32d41/firestore

2. **Create invite link manually:**
   ```
   http://localhost:3000/join?email=test@gmail.com&serverId=YOUR_SERVER_ID
   ```

3. **Test in incognito window:**
   - Open link in incognito
   - Sign in with test account
   - Should join the server

## Quick Test Checklist

- [ ] User A creates server
- [ ] User A sends invite to User B
- [ ] User B clicks invite link
- [ ] User B signs in and joins server
- [ ] Both users see the same server in sidebar
- [ ] User A adds debt → User B sees it instantly
- [ ] User B adds debt → User A sees it instantly
- [ ] Both users see same member list
- [ ] Both users see same debt list

## Debugging Tips

1. **Check browser console** for errors
2. **Check Firestore console** to see if data is being saved
3. **Check Network tab** for Firestore requests
4. **Verify both users are in `memberIds` array** in Firestore

## Common Issues

- **Port mismatch**: Make sure invite links use correct port (3000 or 3001)
- **Firestore permissions**: Rules are deployed, should work
- **Email validation**: Currently bypassed, any account can join
- **Real-time not working**: Check if `onSnapshot` is active in console

