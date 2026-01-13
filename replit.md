# Crypto Pulse Rewards - ADFI

## Overview

A React Native Expo mobile application that functions as a crypto rewards platform (similar to Swagbucks). Users earn points by completing micro-tasks (watching rewarded video ads), with points tracked in stable USD value. Points can be cashed out as XRP cryptocurrency to a connected wallet at current market rates via the CoinGecko API.

The app is designed to be non-custodial (never holds user funds/keys), with automated task verification, payouts, and anti-fraud measures. Currently configured for XRP Testnet development with plans to switch to Mainnet for production.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- Changed header from "index" to "ADFI"
- Added animated splash/loading screen on app launch
- Implemented one-time acknowledgment popup with checkboxes (18+, volatility, risks, terms)
- Created step-by-step onboarding tutorial for first-time users
- Added hamburger menu with navigation to all app sections
- Created dedicated screens: Learn, Legal, Terms, Referral, Badges
- Updated reward system to use variable points (15% of ad revenue)
- Implemented video completion requirement before awarding points
- Added user levels (Bronze, Silver, Gold) and badge system
- Added referral program with unique codes

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router with file-based routing (routes defined in `/app` directory)
- **State Management**: Zustand with persistence middleware for global app state
- **Storage**: AsyncStorage for persisting wallet connections, onboarding state, and user data
- **UI Components**: Custom themed components with light/dark mode support

### App Screens (in `/app` directory)
- `index.tsx` - Main dashboard with balance, tasks, wallet status
- `learn.tsx` - Crypto basics and XRP education
- `legal.tsx` - Legal disclaimers and risk disclosures
- `terms.tsx` - Terms of Use
- `referral.tsx` - Referral program with unique codes
- `badges.tsx` - User badges and level progression

### Components (in `/src/components`)
- `SplashScreen.tsx` - Animated loading screen
- `OnboardingScreen.tsx` - Step-by-step tutorial for new users
- `AcknowledgmentPopup.tsx` - Required checkboxes before using app
- `VideoPlayer.tsx` - Video ad player with completion tracking

### Key Application Features
- **Splash Screen**: Animated loading screen on app launch
- **Onboarding**: 4-step tutorial explaining how the app works
- **Acknowledgment Popup**: Required checkboxes for volatility, age, risks, and terms
- **Wallet Connection**: XUMM SDK (Xaman) integration for XRP wallet connectivity
- **Points System**: USD-pegged points (100 points = $1) with daily earning caps ($5/day)
- **Variable Rewards**: Users earn 15% of actual ad revenue per task
- **Video Completion**: Must watch full video to earn points
- **Levels & Badges**: Bronze (100pts), Silver (500pts), Gold (1000pts)
- **Referral Program**: 10% of referee earnings for 30 days
- **Price Fetching**: Real-time XRP prices from CoinGecko API
- **Cashout Flow**: Minimum $5 threshold, converts points to XRP at current market rate

### State Management Pattern
The app uses Zustand store (`src/store/useStore.ts`) with the following state:
- Points balance and daily earnings tracking
- Wallet connection status and address
- Onboarding completion status
- Terms acceptance status
- User level (Bronze/Silver/Gold)
- Badges collection
- Referral code and count
- Persistence to AsyncStorage for session continuity

### Security Considerations
- Non-custodial design - app never holds private keys
- Daily earning caps ($5/day) to prevent abuse
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
