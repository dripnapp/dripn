# Drip'n - Crypto Rewards App

## Overview

A React Native Expo mobile application that functions as a crypto rewards platform. Users earn drips (the in-app currency) by completing micro-tasks (watching rewarded video ads, AdMob, offerwalls, and sharing). Users can redeem accumulated drips for XRP cryptocurrency through CoinGate, a licensed third-party payment processor.

**IMPORTANT LEGAL DISTINCTION**: Drip'n does NOT hold funds, custody cryptocurrency, hold private keys, or sign transactions. All cryptocurrency payouts are processed and executed by CoinGate. Drip'n simply sends redemption requests to CoinGate, which then converts the drip value to XRP at real-time market rates and sends the XRP directly to the user's connected wallet.

**Tagline:** "every drip counts"

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

### Tokenomics Update (NEW)
- **Minimum Redemption**: Increased from 1,000 to 5,000 drips
- **Daily Earning Cap**: Increased from 500 to 5,000 drips/day
- **Video Ad Rewards**: 100 drips (standard) or 200 drips (premium)
- **Offerwall Rewards**: 100 drips per completed offer
- **First Video Badge**: Automatically unlocks "First Steps" badge (+50 bonus drips) on first video completion
- **Welcome Message**: Displays personalized "Welcome, [username]" below header after username setup

### Badge Rewards (Updated)
- First Steps: +50 drips (watch first video)
- Bronze Member: +250 drips (earn 5,000 total drips)
- Silver Member: +500 drips (earn 10,000 total drips)
- Gold Member: +1,000 drips (earn 20,000 total drips)
- First Cashout: +500 drips (complete first payout)
- Referrer: +250 drips (refer first friend)
- Week Warrior: +350 drips (7-day login streak)
- Monthly Master: +1,500 drips (30-day login streak)

### Level Thresholds (Updated)
- Bronze: 5,000 total drips earned
- Silver: 10,000 total drips earned
- Gold: 20,000 total drips earned

### Redemption System
- **Multi-step Redemption Flow**: Users go through input → warnings → terms acceptance → final confirmation → processing → success
- **Real-time XRP Pricing**: Fetches current XRP/USD price from CoinGecko/Binance APIs at time of redemption
- **CoinGate Integration**: All payouts processed by CoinGate (third-party payment processor)
- **Transaction Tracking**: Transaction IDs provided for tracking redemptions
- **Redemption Terms**: 1-3 day processing, non-cancellable, non-transferable
- **Visual Success Banner**: Animated confirmation when redemption is submitted

### Connect Wallet
- **Connect Wallet Button**: Re-added to main dashboard (placeholder for future wallet connection)
- Users will need to connect an XRP wallet address to receive redemptions

### Legal Compliance Updates
- Updated all app screens with new legal language about CoinGate processing
- Clear disclaimers that Drip'n does not hold/custody/transfer funds
- Updated Learn, Legal, Terms, and History pages with redemption information

### Web Compatibility (January 2026)
- **Platform-specific Ads**: Created `src/utils/ads.ts` (native) and `src/utils/ads.web.ts` (web) to handle react-native-google-mobile-ads incompatibility with web
- **Splash Screen**: Splash screen now only shows on native platforms (iOS/Android), skipped on web for better compatibility
- **UI Gradients**: Using expo-linear-gradient for premium visual effects across the app

### Previous Changes
- **MAJOR REBRAND**: Changed app name from "droply.io" to "Drip'n"
- Changed all "drops" references to "drips" throughout the app
- Updated logo with new Drip'n branding (assets/images/dripn-logo.png)
- Premium theme store: 6 themes (Classic free, 5 premium at 1,000 drips each)
- Daily earning reset at midnight user timezone with 5,000 drip cap
- Share Task Features: 3x daily limit, 1-minute cooldown, progressive rewards

## Redemption Flow Architecture

### User Flow
1. User taps "Redeem Drips" button on main dashboard
2. Input screen: Enter drips amount (min 5,000), shows available balance
3. Warning screen: Terms displayed (1-3 days processing, no cancellation, no transfer)
4. User must check acceptance checkbox
5. Confirmation screen: "You are submitting X Drips to be Redeemed?"
6. Processing screen: Animated loader while request is submitted
7. Success screen: Visual banner with XRP amount and transaction ID

### Technical Flow
1. App fetches real-time XRP/USD price from CoinGecko (fallback: Binance)
2. Conversion: drips → USD (at 0.001284 rate) → XRP (at market rate)
3. App sends request to CoinGate API
4. CoinGate processes payout and sends XRP to user's wallet
5. CoinGate provides transaction ID
6. App displays success confirmation

### Key Legal Points
- Drip'n does NOT hold funds
- Drip'n does NOT custody cryptocurrency
- Drip'n does NOT hold private keys
- Drip'n does NOT sign transactions
- CoinGate is the payment processor and sender of XRP
- All conversion rates are real-time market rates (no fixed exchange rates exposed)

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router with file-based routing (routes defined in `/app` directory)
- **State Management**: Zustand with persistence middleware for global app state
- **Storage**: AsyncStorage for persisting onboarding state and user data
- **UI Components**: Custom themed components with light/dark mode support

### App Screens (in `/app` directory)
- `index.tsx` - Main dashboard with balance, tasks, Connect Wallet, Redeem Drips
- `history.tsx` - History page with rewards, redemptions, and transaction tracking
- `settings.tsx` - User settings (username, theme selection)
- `contact.tsx` - Contact/support page with email link
- `learn.tsx` - How redemptions work and crypto education
- `legal.tsx` - Legal disclaimers including CoinGate processing info
- `terms.tsx` - Terms of Use with redemption terms
- `referral.tsx` - Referral program with unique codes
- `badges.tsx` - User badges and level progression
- `leaderboard.tsx` - Top earners ranking (uses totalEarned)

### Components (in `/src/components`)
- `AppHeader.tsx` - Shared header with hamburger menu navigation
- `RedeemDripsModal.tsx` - Multi-step redemption flow modal
- `SplashScreen.tsx` - Animated loading screen with Drip'n branding
- `OnboardingScreen.tsx` - Step-by-step tutorial for new users
- `AcknowledgmentPopup.tsx` - Required checkboxes before using app
- `VideoPlayer.tsx` - Video ad player with completion tracking
- `UsernameSetup.tsx` - Profile username configuration

### Key Application Features
- **Splash Screen**: Animated loading screen with Drip'n logo
- **Onboarding**: 4-step tutorial explaining how the app works
- **Acknowledgment Popup**: Required checkboxes for age, risks, and terms
- **Drips System**: Rewards currency that can be redeemed for XRP
- **Levels & Badges**: Bronze (5,000 drips), Silver (10,000 drips), Gold (20,000 drips)
- **Referral Program**: 10% of referee earnings for 30 days
- **Redemption**: Multi-step flow to convert drips to XRP via CoinGate
- **History Tracking**: All rewards and redemptions logged with timestamps

### State Management Pattern
The app uses Zustand store (`src/store/useStore.ts`) with the following state:
- Drips balance and daily earnings tracking
- Total earned tracking (lifetime, for leaderboard)
- History records for rewards and redemptions
- Wallet address storage
- Redemption records with status tracking
- Onboarding/terms acceptance status
- User level and badges
- Theme preferences and unlocked themes
- Persistence to AsyncStorage for session continuity

### Security Considerations
- Daily earning caps (5,000 drips/day) to prevent abuse
- Required acknowledgment checkboxes before accessing tasks
- Age verification (18+)
- Clear legal disclaimers throughout app
- No storage of private keys or sensitive wallet data
- Transaction IDs for tracking all redemptions

### CPX Research Integration (January 2026)
- **Provider Change**: Replaced AdGem and BitLabs with CPX Research (App ID: 31158)
- **Survey Wall**: CPX Research surveys accessible via WebView modal
- **Secure Hash**: Uses EXPO_PUBLIC_CPX_SECURE_HASH environment variable for API authentication
- **URL Format**: `https://offers.cpx-research.com/index.php?app_id=31158&ext_user_id={uniqueId}&secure_hash={hash}&username={username}&subid_1=dripn&subid_2=mobile`
- **Rewards**: 100 drips per completed survey

### Privacy & GDPR Compliance (January 2026)
- **Region Detection**: Uses expo-localization to detect EU vs US users
- **EU Users**: See full GDPR consent flow (consent popup with Drip'n logo, manage data preferences, vendor list with AdMob/CPX Research/Unity Ads)
- **US Users**: See simplified CCPA-style data preferences popup
- **Revocation**: Users can revoke consent anytime from Settings > Privacy > Revoke Consent
- **Theme Integration**: All privacy popups respect the app's theme system
- **Privacy Components**: Located in `src/components/PrivacyConsent/`

## External Dependencies

### Reward Networks
- **react-native-google-mobile-ads**: AdMob rewarded video ads (with Unity Ads mediation)
- **react-native-webview**: Hosting CPX Research survey wall
- **CPX Research**: Survey provider (App ID: 31158) - replaced AdGem and BitLabs

### Payment Processing
- **CoinGate API**: Third-party payment processor for XRP payouts (to be integrated)
- **CoinGecko/Binance APIs**: Real-time XRP/USD price fetching

### Storage & Data
- **@react-native-async-storage/async-storage**: Local device storage
- **zustand**: Lightweight state management with persistence middleware

### HTTP & Networking
- **axios**: HTTP client for API requests

### UI & Navigation
- **expo-router**: File-based routing system
- **@expo/vector-icons**: Icon library (MaterialCommunityIcons)

### Expo Modules
- expo-constants, expo-font, expo-linking, expo-splash-screen, expo-status-bar, expo-web-browser
