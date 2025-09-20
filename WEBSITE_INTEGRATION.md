# Website Integration Guide

## Overview
The mobile app now seamlessly redirects users to `https://lovelock.it.com` for subscription payments, passing user credentials for automatic authentication.

## How It Works

### 1. Mobile App → Website Redirect
When users click "Upgrade" in the mobile app:

```typescript
// URL format sent to website
https://lovelock.it.com/pricing?tier=premium&userId=user_123&email=user@example.com&source=mobile
```

**Parameters passed:**
- `tier`: "premium" or "unlimited"
- `userId`: Clerk user ID
- `email`: User's email address
- `source`: "mobile" (to identify mobile app users)

### 2. Website Integration Requirements

Your NextJS website should:

#### A. Handle URL Parameters
```javascript
// pages/pricing.js or app/pricing/page.js
export default function PricingPage() {
  const { tier, userId, email, source } = useSearchParams();

  // Pre-select the tier from mobile app
  if (tier) {
    setSelectedTier(tier);
  }

  // Show mobile-specific UI if needed
  if (source === 'mobile') {
    showMobileReturnMessage();
  }
}
```

#### B. Auto-Authentication (if user exists)
Since you're using the same Clerk instance:
```javascript
// Check if user is already signed in
const { user } = useUser();

if (!user && email) {
  // Optionally pre-fill sign-in form
  setEmailField(email);
}
```

#### C. Payment Success/Failure Callbacks
After payment processing, redirect back to mobile app:

```javascript
// Success
window.location = `lovelock://payment-success?tier=${tier}&sessionId=${sessionId}`;

// Cancellation
window.location = `lovelock://payment-cancelled`;

// Failure
window.location = `lovelock://payment-failed?error=${errorMessage}`;
```

### 3. Mobile App Deep Link Handling

The mobile app automatically handles these return URLs:

- ✅ `lovelock://payment-success` - Shows success message
- ❌ `lovelock://payment-cancelled` - Shows cancellation message
- ⚠️ `lovelock://payment-failed` - Shows error message

### 4. User Experience Flow

```
Mobile App (Upgrade Button)
    ↓
Website (Secure Checkout)
    ↓
Mobile App (Success/Failure)
    ↓
Subscription Sync (Automatic via Clerk/Supabase)
```

## Implementation in Website

### Required Pages/Routes:
1. `/pricing` - Main pricing page that accepts mobile parameters
2. Payment success handler that redirects to mobile app
3. Payment failure handler that redirects to mobile app

### Example Implementation:

```jsx
// Website pricing page
export default function PricingPage() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier');
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');
  const source = searchParams.get('source');

  // Handle mobile app users
  if (source === 'mobile') {
    return (
      <div>
        <h1>Complete Your Subscription</h1>
        <p>Continue from your mobile app...</p>
        {/* Pre-selected tier from mobile */}
        <PricingTable selectedTier={tier} />
      </div>
    );
  }

  // Regular web users
  return <RegularPricingPage />;
}

// After successful payment
function handlePaymentSuccess(sessionId, tier) {
  // Update user subscription in Supabase
  await updateUserSubscription(userId, tier);

  // Redirect back to mobile app
  window.location = `lovelock://payment-success?tier=${tier}&sessionId=${sessionId}`;
}
```

## Testing

1. **Mobile App**: Click upgrade button - should open website
2. **Website**: Complete payment - should return to mobile app
3. **Mobile App**: Should show success message and sync subscription

## Security Notes

- User credentials are passed via URL parameters (consider using state/session for sensitive data)
- Clerk handles authentication security automatically
- Supabase row-level security ensures data integrity
- Deep links are validated before processing

## Benefits

✅ **Seamless UX**: Users don't need to re-authenticate
✅ **Secure**: Clerk + Supabase handle security
✅ **Simple**: One payment flow to maintain
✅ **Professional**: Web checkout feels more trustworthy
✅ **Automatic Sync**: Subscription status updates instantly