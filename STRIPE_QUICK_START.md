# 🚀 Stripe Integration - Quick Start Guide

## ✅ Your Stripe Code is Already Integrated!

The payment functionality is already built into your app. You just need to add your Stripe API keys.

---

## 📝 Step-by-Step Setup (5 minutes)

### Step 1: Get Stripe API Keys (2 minutes)

1. **Go to**: https://dashboard.stripe.com/register
2. **Sign up** (free) or **log in** if you have an account
3. **Get your test keys**:
   - Click **"Developers"** in the left sidebar
   - Click **"API keys"**
   - You'll see:
     - **Publishable key** (starts with `pk_test_...`) - Copy this
     - **Secret key** (starts with `sk_test_...`) - Click "Reveal" and copy this

### Step 2: Add Keys to Your Project (1 minute)

1. **Open** `.env.local` file in your project root
2. **Replace** the placeholder with your actual keys:

```bash
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE

# Your app URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Example:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123...
STRIPE_SECRET_KEY=sk_test_51XyZ789...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 3: Restart Your Server (30 seconds)

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 4: Test It! (1 minute)

1. **Open**: `http://localhost:3000`
2. **Sign in** with Google
3. **Create a server** and add a debt
4. **Click "Pay Now"** on any debt
5. **Select "Credit/Debit Card"**
6. **Use Stripe test card**:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: `12/34` (any future date)
   - **CVC**: `123` (any 3 digits)
   - **ZIP**: `12345` (any 5 digits)
7. **Click "Pay"** → Should redirect to Stripe checkout
8. **Complete payment** → Should redirect back and remove the debt

---

## 🧪 Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |

**All use**: Any future expiry, any CVC, any ZIP

---

## ✅ That's It!

Your Stripe integration is now ready! The payment flow will:
1. ✅ Open Stripe Checkout when user clicks "Pay Now"
2. ✅ Process payment securely
3. ✅ Redirect back to your app
4. ✅ Automatically remove the debt on success

---

## 🐛 Troubleshooting

**"Stripe is not defined"**:
- Make sure you restarted the server after adding keys

**"Invalid API Key"**:
- Double-check keys are correct (no extra spaces)
- Make sure keys start with `pk_test_` and `sk_test_`
- Restart server after adding keys

**Payment doesn't redirect**:
- Check browser console for errors
- Verify `NEXT_PUBLIC_BASE_URL` is set correctly

---

## 🚀 Going Live

When ready for production:
1. Switch Stripe Dashboard to **"Live mode"**
2. Get your **live keys** (start with `pk_live_` and `sk_live_`)
3. Update `.env.local` with live keys
4. Deploy to production with live keys in your hosting platform's environment variables

---

**Need help?** Check the full guide in `STRIPE_SETUP.md` or visit https://stripe.com/docs

