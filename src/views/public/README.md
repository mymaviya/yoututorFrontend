# GSAP Updated Public Pages

These Vue public pages have been updated to use GSAP ScrollTrigger based animations.

## Required package

Run this in your frontend project:

```bash
npm install gsap
```

## Files included

- HomePage.vue
- AboutPage.vue
- ContactPage.vue
- PricingPage.vue
- CheckoutPage.vue
- TermsPage.vue
- PrivacyPolicyPage.vue
- RefundPolicyPage.vue
- ShippingPolicyPage.vue
- SubscriptionExpired.vue
- SubscriptionFailedPage.vue
- SubscriptionSuccessPage.vue

## What was changed

- Removed old CSS reveal/animate rules that were hiding elements or causing broken animation behavior.
- Added GSAP + ScrollTrigger imports to each page.
- Added reusable page-level GSAP animation initialization.
- Kept your existing page layout, content, API calls, forms and Vuetify structure unchanged.

## Important

If your project already has `PricingPage.vue` and `PrivacyPolicyPage.vue`, replace them with the files from this ZIP.
