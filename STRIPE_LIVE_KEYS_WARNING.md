# ⚠️ IMPORTANT: You're Using LIVE Stripe Keys

## 🚨 Security Notice

You've configured **LIVE Stripe keys** which means:
- ✅ Payments will process **REAL MONEY**
- ✅ Transactions will appear in your Stripe Dashboard
- ✅ You'll be charged Stripe fees (2.9% + $0.30 per transaction)
- ⚠️ **Test cards won't work** - you need real credit cards

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git** (should already be in `.gitignore`)
2. **Never share your secret key** (`sk_live_...`)
3. **Rotate keys immediately** if they're ever exposed
4. **Use test keys for development** when possible

## 🧪 For Local Testing

If you want to test without real payments, use **test keys**:

1. Go to Stripe Dashboard → Switch to **"Test mode"**
2. Get test keys (start with `pk_test_` and `sk_test_`)
3. Update `.env.local` with test keys
4. Use test cards like `4242 4242 4242 4242`

## ✅ Your Current Setup

- **Publishable Key**: `pk_live_...` ✅ Configured
- **Secret Key**: `sk_live_...` ✅ Configured
- **Base URL**: `http://localhost:3000` (for local dev)

## 🚀 Testing with Live Keys

When using live keys:
- Use **real credit cards** (your own for testing)
- Payments will be **real transactions**
- Check Stripe Dashboard to see payments
- Refunds can be issued from Stripe Dashboard if needed

## 📝 Next Steps

1. ✅ Keys are configured
2. ✅ Server restarted
3. 🧪 **Test the payment flow**:
   - Create a server
   - Add a debt
   - Click "Pay Now"
   - Use a real credit card
   - Complete payment

## 🔄 Switching Between Test/Live

**For Development (Test Mode)**:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**For Production (Live Mode)**:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

Your keys are now configured and ready to use! 🎉

