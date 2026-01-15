# droply.io - Crypto Rewards App

## Overview

A React Native Expo mobile application that functions as a crypto rewards platform. Users earn drops (the in-app currency) by completing micro-tasks (watching rewarded video ads). Drops can be cashed out as XRP cryptocurrency to a connected wallet at current market rates via the CoinGecko API.

The app is designed to be non-custodial (never holds user funds/keys), with automated task verification, payouts, and anti-fraud measures. Currently configured for XRP Testnet development with plans to switch to Mainnet for production.

**Tagline:** "every drop counts"

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- Added Settings page with username editing and theme switching
- Implemented Classic and Dark theme modes with visual theme picker
- Theme applied consistently across all screens (home, learn, badges, leaderboard, referral, settings)
- Header bar remains consistent with dark (#0d1117) background in both themes
- User-cropped logo image used for splash screen and header (assets/images/logo-cropped.jpg)
- Added custom droply.io logo image (PNG) to splash screen and main page header
- Rebranded app from "droply" to "droply.io" throughout to differentiate from other apps in the market
- Changed referral code prefix from "DROP-" to "DPLY-"
- Changed "Drops" to "drops" (lowercase) in balance display
- Added locale-aware currency formatting for international users (using Intl.NumberFormat)
- Updated Learn Crypto screen with droply.io branding and legal disclaimers
- Using expo-image for optimized image loading across platforms

### Logo Notes
- Custom logo PNG provided by user (gradient water drop with play button + "droply.io" text)
- Original logo saved as `assets/images/logo.png` (1MB), optimized version as `logo-small.png` (73KB)
- Logo may have loading delays on web preview but works properly on native iOS/Android builds

### Previous Changes
- Implemented one-time acknowledgment popup with checkboxes (18+, volatility, risks, terms)
- Created step-by-step onboarding tutorial for first-time users
- Added hamburger menu with navigation to all app sections
- Created dedicated screens: Learn, Legal, Terms, Referral, Badges, Leaderboard
- Updated reward system to use variable drops (15% of ad revenue)
- Implemented video completion requirement before awarding drops
- Added user levels (Bronze, Silver, Gold) and badge system with rewards
- Added referral program with unique codes and input for entering codes
- Added wallet disconnect/logout functionality
- Added leaderboard with live ranking based on user drops
- Badge rewards: users earn bonus drops when claiming unlocked badges
- Added unique username system for user profiles (shown on leaderboard)
- Default username displays truncated wallet address (first 4...last 4 chars)
- Implemented real XUMM/Xaman wallet connection flow (requires API keys)

### Production Notes
- Username uniqueness currently uses client-side reserved names list. Production deployment will require a backend API to check username availability against a central database.
- XUMM API requires `EXPO_PUBLIC_XUMM_API_KEY` and `EXPO_PUBLIC_XUMM_API_SECRET` environment variables to be set for real wallet connections.
- Video rewards are calculated as 15% of actual ad revenue. In production, rewards will only be granted when AdMob confirms successful ad completion.

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
- `index.tsx` - Main dashboard with balance, tasks, wallet status
- `settings.tsx` - User settings (username, theme selection)
- `learn.tsx` - Crypto basics and XRP education
- `legal.tsx` - Legal disclaimers and risk disclosures
- `terms.tsx` - Terms of Use
- `referral.tsx` - Referral program with unique codes
- `badges.tsx` - User badges and level progression
- `leaderboard.tsx` - Top earners ranking

### Components (in `/src/components`)
- `SplashScreen.tsx` - Animated loading screen with droply.io branding
- `OnboardingScreen.tsx` - Step-by-step tutorial for new users
- `AcknowledgmentPopup.tsx` - Required checkboxes before using app
- `VideoPlayer.tsx` - Video ad player with completion tracking
- `UsernameSetup.tsx` - Profile username configuration
- `DroplyLogo.tsx` - Reusable logo component with water drop and play button icon

### Key Application Features
- **Splash Screen**: Animated loading screen with droply.io logo on app launch
- **Onboarding**: 4-step tutorial explaining how the app works
- **Acknowledgment Popup**: Required checkboxes for volatility, age, risks, and terms
- **Wallet Connection**: XUMM SDK (Xaman) integration for XRP wallet connectivity
- **Drops System**: 100 drops = $1 USD value, with daily earning caps (500 drops/day)
- **Variable Rewards**: Users earn 15% of actual ad revenue per task
- **Video Completion**: Must watch full video to earn drops
- **Levels & Badges**: Bronze (100 drops), Silver (500 drops), Gold (1000 drops)
- **Referral Program**: 10% of referee earnings for 30 days, codes prefixed with "DPLY-"
- **Price Fetching**: Real-time XRP prices from CoinGecko API with locale-aware formatting
- **Cashout Flow**: Minimum 500 drops threshold, converts drops to XRP at current market rate

### State Management Pattern
The app uses Zustand store (`src/store/useStore.ts`) with the following state:
- Drops balance and daily earnings tracking
- Wallet connection status and address
- Onboarding completion status
- Terms acceptance status
- User level (Bronze/Silver/Gold)
- Badges collection
- Referral code and count
- Persistence to AsyncStorage for session continuity

### Security Considerations
- Non-custodial design - app never holds private keys
- Daily earning caps (500 drops/day) to prevent abuse
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
