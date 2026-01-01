# Stripe Integration Setup Guide

## ✅ Quick Setup Steps

### Step 1: Get Your Stripe API Keys

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Sign up or log in** to your Stripe account
3. **Get your API keys**:
   - Click on **"Developers"** → **"API keys"**
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_` for test mode)
     - **Secret key** (starts with `sk_test_` for test mode) - Click "Reveal" to see it

### Step 2: Add Environment Variables

1. **Open or create** `.env.local` file in your project root
2. **Add these variables**:

```bash
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Your app URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important**: 
- Replace `YOUR_PUBLISHABLE_KEY_HERE` with your actual publishable key
- Replace `YOUR_SECRET_KEY_HERE` with your actual secret key
- Never commit `.env.local` to git (it should already be in `.gitignore`)

### Step 3: Install Stripe (if not already installed)

```bash
npm install stripe @stripe/stripe-js
```

### Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test the Integration

1. **Open your app**: `http://localhost:3000`
2. **Sign in** with your Google account
3. **Create a server** and add a debt
4. **Click "Pay Now"** on a debt
5. **Select "Credit/Debit Card"** (Stripe)
6. **Use Stripe test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## 🧪 Testing with Stripe Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**All test cards use**:
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## 🔒 Security Notes

1. **Never commit** `.env.local` to git
2. **Use test keys** for development
3. **Switch to live keys** only when deploying to production
4. **Secret key** should NEVER be exposed in client-side code

## 🚀 Production Deployment

When deploying to production:

1. **Get live API keys** from Stripe Dashboard (toggle to "Live mode")
2. **Update environment variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
3. **Update** `NEXT_PUBLIC_BASE_URL` to your production URL

## 📋 Checklist

- [ ] Created Stripe account
- [ ] Got API keys (test mode)
- [ ] Added keys to `.env.local`
- [ ] Restarted dev server
- [ ] Tested payment flow with test card
- [ ] Verified payment success redirect works
- [ ] Verified payment cancellation works

## 🐛 Troubleshooting

**"Stripe is not defined" error**:
- Make sure `stripe` package is installed: `npm install stripe`

**"Invalid API Key" error**:
- Check that keys are correct in `.env.local`
- Make sure you're using test keys (start with `pk_test_` and `sk_test_`)
- Restart your dev server after adding keys

**Payment redirect not working**:
- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify the success/cancel URLs in the API route

**Payment succeeds but debt not removed**:
- Check browser console for errors
- Verify the payment success callback is working
- Check Firestore rules allow debt removal

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/)

