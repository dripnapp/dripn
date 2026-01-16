# Drip'n - Crypto Rewards App

## Overview

A React Native Expo mobile application that functions as a crypto rewards platform. Users earn drips (the in-app currency) by completing micro-tasks (watching rewarded video ads). Drips can be cashed out as XRP cryptocurrency to a connected wallet at current market rates via the CoinGecko API.

The app is designed to be non-custodial (never holds user funds/keys), with automated task verification, payouts, and anti-fraud measures. Currently configured for XRP Testnet development with plans to switch to Mainnet for production.

**Tagline:** "every drip counts"

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **MAJOR REBRAND**: Changed app name from "droply.io" to "Drip'n"
- Changed all "drops" references to "drips" throughout the app
- Updated logo with new Drip'n branding (assets/images/dripn-logo.jpg)
- Updated splash screen with animated "Loading..." text
- Added Instagram as share option alongside X, Facebook, and Text/SMS
- Updated X (Twitter) share button with proper X icon and black background
- Created History page for tracking rewards and cashouts
- Added totalEarned tracking for leaderboard (separate from spendable balance)
- Updated contact email to dripnapp@proton.me
- Updated referral code prefix from "DPLY-" to "DRPN-"
- **NAVIGATION UPDATE**: Created shared AppHeader component with hamburger menu visible on ALL pages
- Lowered header position (50px top padding) for better mobile accessibility

### Share Task Features
- Anti-abuse measures: 3x daily limit, 1-minute cooldown between shares
- Share rewards: 1 drip (first), 1 drip (second), 3 drips (third) = 5 drips max per day
- Share options: X (Twitter), Facebook, Instagram, or Text/SMS

### Video Reward System
- Standard ads (60% chance): 10-15s duration, 1-2 drips reward
- Premium ads (40% chance): 20-30s duration, 3-4 drips reward
- Rewards capped at 25% of lowest expected ad revenue (~$0.005-0.01 per view)

### History Page Features
- View available drips balance
- View total earned drips (lifetime)
- View total cashed out drips
- Recent activity list with source, date, and amount
- Total earned used for leaderboard ranking (allows cashout without losing rank)

### Logo Notes
- Custom logo PNG provided by user (gradient water drop with play button + "drip'n" text)
- Logo saved as `assets/images/dripn-logo.jpg`
- Header and splash screen use the same logo with dark background (#12122a)

### Previous Changes
- Implemented one-time acknowledgment popup with checkboxes (18+, volatility, risks, terms)
- Created step-by-step onboarding tutorial for first-time users
- Added hamburger menu with navigation to all app sections
- Created dedicated screens: Learn, Legal, Terms, Referral, Badges, Leaderboard, History
- Updated reward system to use variable drips (15% of ad revenue)
- Implemented video completion requirement before awarding drips
- Added user levels (Bronze, Silver, Gold) and badge system with rewards
- Added referral program with unique codes and input for entering codes
- Added wallet disconnect/logout functionality
- Added leaderboard with live ranking based on total earned drips
- Badge rewards: users earn bonus drips when claiming unlocked badges
- Added unique username system for user profiles (shown on leaderboard)
- Default username displays truncated wallet address (first 4...last 4 chars)
- Implemented real XUMM/Xaman wallet connection flow (requires API keys)

### Production Notes
- Username uniqueness currently uses client-side reserved names list. Production deployment will require a backend API to check username availability against a central database.
- XUMM API requires `EXPO_PUBLIC_XUMM_API_KEY` and `EXPO_PUBLIC_XUMM_API_SECRET` environment variables to be set for real wallet connections.
- Video rewards use value tiers to approximate ad revenue proportionality (1-4 drips based on estimated ad value)
- Share rewards are limited to 3x daily with anti-abuse measures (1-minute cooldown, device tracking)
- AdMob iOS configuration: App ID `ca-app-pub-4501953262639636~3485723863`, Ad Unit ID `ca-app-pub-4501953262639636/8435825886`
- Contact email: dripnapp@proton.me

## International Currency Display

The app uses JavaScript's built-in `Intl.NumberFormat` API for locale-aware currency formatting:
- Automatically detects user's locale via `navigator.language`
- Formats currency display according to user's region (e.g., "$2.11" for US, "2,11 $" for some European countries)
- Falls back to standard USD format if locale detection fails
- **Note:** XRP prices are always fetched in USD from CoinGecko API and displayed with locale formatting
- App Store handles localization of app listing/pricing separately - this only affects in-app currency display

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router with file-based routing (routes defined in `/app` directory)
- **State Management**: Zustand with persistence middleware for global app state
- **Storage**: AsyncStorage for persisting wallet connections, onboarding state, and user data
- **UI Components**: Custom themed components with light/dark mode support

### App Screens (in `/app` directory)
- `index.tsx` - Main dashboard with balance, tasks (video + share), wallet status
- `history.tsx` - History page with rewards, cashouts, and total earned tracking
- `settings.tsx` - User settings (username, theme selection)
- `contact.tsx` - Contact/support page with email link
- `learn.tsx` - Crypto basics and XRP education
- `legal.tsx` - Legal disclaimers and risk disclosures
- `terms.tsx` - Terms of Use
- `referral.tsx` - Referral program with unique codes
- `badges.tsx` - User badges and level progression
- `leaderboard.tsx` - Top earners ranking (uses totalEarned)

### Components (in `/src/components`)
- `AppHeader.tsx` - Shared header with hamburger menu navigation (used on all pages)
- `SplashScreen.tsx` - Animated loading screen with Drip'n branding
- `OnboardingScreen.tsx` - Step-by-step tutorial for new users
- `AcknowledgmentPopup.tsx` - Required checkboxes before using app
- `VideoPlayer.tsx` - Video ad player with completion tracking
- `UsernameSetup.tsx` - Profile username configuration

### Key Application Features
- **Splash Screen**: Animated loading screen with Drip'n logo on app launch
- **Onboarding**: 4-step tutorial explaining how the app works
- **Acknowledgment Popup**: Required checkboxes for volatility, age, risks, and terms
- **Wallet Connection**: XUMM SDK (Xaman) integration for XRP wallet connectivity
- **Drips System**: 100 drips = $1 USD value, with daily earning caps (500 drips/day)
- **Variable Rewards**: Users earn 15% of actual ad revenue per task
- **Video Completion**: Must watch full video to earn drips
- **Levels & Badges**: Bronze (100 drips), Silver (500 drips), Gold (1000 drips)
- **Referral Program**: 10% of referee earnings for 30 days, codes prefixed with "DRPN-"
- **Price Fetching**: Real-time XRP prices from CoinGecko API with locale-aware formatting
- **Cashout Flow**: Minimum 500 drips threshold, converts drips to XRP at current market rate
- **History Tracking**: All rewards and cashouts logged with timestamps

### State Management Pattern
The app uses Zustand store (`src/store/useStore.ts`) with the following state:
- Drips balance and daily earnings tracking
- Total earned tracking (lifetime, for leaderboard)
- History records for rewards and cashouts
- Wallet connection status and address
- Onboarding completion status
- Terms acceptance status
- User level (Bronze/Silver/Gold)
- Badges collection
- Referral code and count
- Persistence to AsyncStorage for session continuity

### Security Considerations
- Non-custodial design - app never holds private keys
- Daily earning caps (500 drips/day) to prevent abuse
- Required acknowledgment checkboxes before accessing tasks
- Age verification (18+)
- Clear legal disclaimers throughout app
- API keys should be moved to backend proxy for production

## External Dependencies

### Cryptocurrency & Wallet
- **xumm-sdk**: XRP wallet connection and transaction signing via Xaman app
- **CoinGecko API**: Real-time XRP/USD price fetching (no API key required for basic usage)

### Storage & Data
- **@react-native-async-storage/async-storage**: Local device storage for persisting user data
- **zustand**: Lightweight state management with persistence middleware

### HTTP & Networking
- **axios**: HTTP client for API requests (CoinGecko price data)

### UI & Navigation
- **expo-router**: File-based routing system
- **@expo/vector-icons**: Icon library (MaterialCommunityIcons)

### Expo Modules
- expo-constants, expo-font, expo-linking, expo-splash-screen, expo-status-bar, expo-web-browser

### Development Notes
- Currently uses XRP Testnet (switchable to Mainnet)
- XUMM integration uses mock for web environment (works fully on native)
- AdMob integration is placeholder/future implementation
- Rewards are calculated as 15% of simulated ad revenue
