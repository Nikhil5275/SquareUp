# Deployment Instructions for SquareUp App

## Option 1: Vercel (Recommended for Next.js)
1. Go to https://vercel.com/new
2. Import your GitHub repository (push your code to GitHub first)
3. Vercel will auto-detect Next.js and deploy
4. Set environment variables in Vercel dashboard

## Option 2: Netlify 
1. Go to https://app.netlify.com/start
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables

## Option 3: Railway
1. Go to https://railway.app/new
2. Connect your GitHub repository  
3. Railway will auto-detect and deploy Next.js

## Environment Variables Needed:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_SECURE
- EMAIL_USER
- EMAIL_PASS
- EMAIL_FROM
- NEXT_PUBLIC_BASE_URL
- FIREBASE_ADMIN_SDK_PATH
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY

Your app is built and ready in the .next folder!
