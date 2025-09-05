# iOS App Store Compliance Checklist

## 🎯 **CRITICAL: Complete this checklist before App Store submission**

This checklist ensures 100% compliance with Apple App Store guidelines by verifying that NO subscription-related UI elements are visible on iOS devices.

---

## ✅ **1. PLATFORM UTILITY FUNCTIONS**

### Test on iOS Device/Simulator:
- [ ] `shouldShowSubscriptionFeatures()` returns `false`
- [ ] `shouldShowPaymentFeatures()` returns `false` 
- [ ] `shouldShowUpgradePrompts()` returns `false`
- [ ] `isIOS()` returns `true`
- [ ] `getSubscriptionMessage()` returns contact support message
- [ ] `getLimitReachedMessage()` returns "Contact support" (not "Upgrade")
- [ ] `getUpgradeMessage()` returns "Contact support" (not "Upgrade")

### Test on Android Device/Simulator:
- [ ] `shouldShowSubscriptionFeatures()` returns `true`
- [ ] `shouldShowPaymentFeatures()` returns `true`
- [ ] `shouldShowUpgradePrompts()` returns `true`
- [ ] All subscription features work normally

---

## ✅ **2. MAIN SUBSCRIPTION SCREENS**

### `/subscription` Screen:
**iOS Testing:**
- [ ] Screen shows "Premium Features" title
- [ ] Screen shows "Contact Support" message
- [ ] Screen shows support email: support@unextdoor.com
- [ ] Screen shows "Contact Support" button
- [ ] Button opens email client with pre-filled subject/body
- [ ] NO subscription plans visible
- [ ] NO pricing information visible
- [ ] NO payment buttons visible

**Android Testing:**
- [ ] Screen shows full subscription interface
- [ ] All subscription plans visible
- [ ] Pricing information displayed correctly
- [ ] Payment buttons functional

### `/subscription_new` Screen:
**iOS Testing:**
- [ ] Same iOS compliance as main subscription screen
- [ ] NO subscription plans visible
- [ ] Shows contact support interface

**Android Testing:**
- [ ] Full subscription functionality works

### `/profile/billing` Screen:
**iOS Testing:**
- [ ] Screen shows "Billing & Subscriptions" title
- [ ] Screen shows contact support message
- [ ] NO billing information visible
- [ ] NO payment history visible
- [ ] NO auto-renewal settings visible

**Android Testing:**
- [ ] Full billing functionality works
- [ ] Payment history visible
- [ ] Auto-renewal settings functional

---

## ✅ **3. HOME SCREEN ELEMENTS**

### Home Screen (`/modern-home`):
**iOS Testing:**
- [ ] NO subscription card visible
- [ ] NO upgrade buttons visible
- [ ] NO "UPGRADE" badges visible
- [ ] Current plan information hidden or minimal

**Android Testing:**
- [ ] Subscription card visible and functional
- [ ] Upgrade buttons work correctly
- [ ] All subscription features functional

---

## ✅ **4. PROFILE SCREEN ELEMENTS**

### Profile Screen (`/profile`):
**iOS Testing:**
- [ ] NO subscription section visible
- [ ] NO billing menu item visible
- [ ] NO transactions menu item visible
- [ ] NO upgrade buttons visible
- [ ] Usage limits show "Contact support" message

**Android Testing:**
- [ ] Subscription section visible and functional
- [ ] Billing and transactions accessible
- [ ] Upgrade buttons work correctly

---

## ✅ **5. PAYMENT DIALOGS**

### Test ALL Payment Dialogs on iOS:
- [ ] `RazorpayPaymentDialog` - NOT rendered
- [ ] `PaymentSuccessDialog` - NOT rendered
- [ ] `UpgradePreviewDialog` - NOT rendered
- [ ] `CurrencyConfirmationDialog` - NOT rendered
- [ ] `PaymentFailureDialog` - NOT rendered

### Test ALL Payment Dialogs on Android:
- [ ] All payment dialogs render correctly
- [ ] All payment flows functional

---

## ✅ **6. UPGRADE PROMPTS & LIMIT MESSAGES**

### Test Limit Reached Scenarios on iOS:
- [ ] Lesson limit message shows "Contact support for more access"
- [ ] NO "Upgrade to continue" messages visible
- [ ] NO upgrade buttons in limit warnings
- [ ] All upgrade prompts replaced with contact information

### Test Limit Reached Scenarios on Android:
- [ ] Upgrade prompts work correctly
- [ ] "Upgrade to continue" messages visible
- [ ] Upgrade buttons functional

---

## ✅ **7. NAVIGATION FLOWS**

### Test Navigation on iOS:
- [ ] Tapping subscription-related elements shows contact alert
- [ ] NO direct navigation to subscription screens
- [ ] Deep links to subscription screens handled appropriately
- [ ] Back navigation from contact screens works

### Test Navigation on Android:
- [ ] All subscription navigation works normally
- [ ] Deep links to subscription screens work
- [ ] All subscription flows functional

---

## ✅ **8. EDGE CASES & ERROR SCENARIOS**

### Test Error States on iOS:
- [ ] Subscription loading errors don't show upgrade prompts
- [ ] Network errors don't expose subscription UI
- [ ] API failures don't leak subscription content

### Test Loading States on iOS:
- [ ] Loading subscription data doesn't show subscription UI
- [ ] Skeleton screens don't contain subscription elements

### Test Deep Linking on iOS:
- [ ] Deep links to `/subscription` show contact screen
- [ ] Deep links to `/profile/billing` show contact screen
- [ ] No subscription URLs accessible

---

## ✅ **9. SEARCH FOR POTENTIAL LEAKS**

### Code Search (case-insensitive):
- [ ] Search "upgrade" - verify all instances use platform utils
- [ ] Search "subscription" - verify all instances are platform-aware
- [ ] Search "payment" - verify all instances are platform-aware
- [ ] Search "billing" - verify all instances are platform-aware
- [ ] Search "razorpay" - verify all instances are hidden on iOS
- [ ] Search "$" - verify no pricing visible on iOS
- [ ] Search "₹" - verify no pricing visible on iOS
- [ ] Search "premium" - verify appropriate messaging on iOS

---

## ✅ **10. FINAL VERIFICATION**

### Complete App Flow on iOS:
- [ ] Fresh app install shows no subscription elements
- [ ] User registration flow has no subscription prompts
- [ ] Lesson completion has no upgrade prompts
- [ ] Profile setup has no subscription options
- [ ] Settings screens have no billing options
- [ ] Help/Support screens appropriate

### Complete App Flow on Android:
- [ ] All subscription features work as expected
- [ ] No functionality broken by iOS compliance changes
- [ ] Payment flows work correctly
- [ ] Upgrade prompts functional

---

## 🚨 **CRITICAL SUCCESS CRITERIA**

### For iOS App Store Approval:
- [ ] **ZERO** subscription-related UI elements visible on iOS
- [ ] **ZERO** payment processing UI visible on iOS
- [ ] **ZERO** upgrade prompts visible on iOS
- [ ] **ZERO** pricing information visible on iOS
- [ ] **ZERO** billing/transaction UI visible on iOS
- [ ] Contact support information provided for premium features
- [ ] App remains fully functional for core features

### For Android Functionality:
- [ ] **ALL** subscription features work normally
- [ ] **ALL** payment flows functional
- [ ] **ALL** upgrade prompts work
- [ ] **NO** functionality broken by iOS compliance

---

## 📋 **TESTING DEVICES**

### Required Testing:
- [ ] iOS Simulator (latest iOS version)
- [ ] Physical iOS device (iPhone)
- [ ] Physical iOS device (iPad) 
- [ ] Android Simulator
- [ ] Physical Android device

### Testing Scenarios:
- [ ] Fresh app install
- [ ] Existing user login
- [ ] Free tier user experience
- [ ] Premium user experience (if applicable)
- [ ] Network connectivity issues
- [ ] App backgrounding/foregrounding

---

## ✅ **SIGN-OFF**

- [ ] **Developer**: All automated tests pass
- [ ] **QA**: Manual testing completed on all devices
- [ ] **Product**: iOS compliance verified
- [ ] **Legal**: App Store guidelines compliance confirmed

**Date Completed**: ___________
**Tested By**: ___________
**Approved By**: ___________

---

## 🎉 **READY FOR APP STORE SUBMISSION**

Once ALL items in this checklist are verified and checked off, the app should be compliant with Apple App Store guidelines and ready for submission.

**Remember**: Apple's review process is thorough. Even one visible subscription element can result in rejection. Complete compliance is essential.
