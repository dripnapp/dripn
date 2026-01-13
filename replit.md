# Crypto Pulse Rewards - ADFI

## Overview

A React Native Expo mobile application that functions as a crypto rewards platform (similar to Swagbucks). Users earn points by completing micro-tasks (watching rewarded video ads), with points tracked in stable USD value. Points can be cashed out as XRP cryptocurrency to a connected wallet at current market rates via the CoinGecko API.

The app is designed to be non-custodial (never holds user funds/keys), with automated task verification, payouts, and anti-fraud measures. Currently configured for XRP Testnet development with plans to switch to Mainnet for production.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router with file-based routing (routes defined in `/app` directory)
- **State Management**: Zustand with persistence middleware for global app state
- **Storage**: AsyncStorage for persisting wallet connections and user data locally
- **UI Components**: Custom themed components with light/dark mode support
- **Animations**: React Native Reanimated for smooth UI animations

### Key Application Features
- **Wallet Connection**: XUMM SDK (Xaman) integration for XRP wallet connectivity via QR codes and deeplinks
- **Points System**: USD-pegged points (100 points = $1) with daily earning caps ($5/day)
- **Price Fetching**: Real-time XRP prices from CoinGecko API
- **Cashout Flow**: Minimum $5 threshold, converts points to XRP at current market rate

### State Management Pattern
The app uses Zustand store (`src/store/useStore.ts`) with the following state:
- Points balance and daily earnings tracking
- Wallet connection status and address
- Automatic daily reset logic for earning caps
- Persistence to AsyncStorage for session continuity

### Security Considerations
- Non-custodial design - app never holds private keys
- Daily earning caps to prevent abuse
- Placeholder for CAPTCHA integration on tasks
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
- **@react-navigation/bottom-tabs**: Tab navigation
- **react-native-reanimated**: Animation library
- **react-native-gesture-handler**: Touch gesture handling
- **@expo/vector-icons**: Icon library (MaterialCommunityIcons)

### Expo Modules
- expo-blur, expo-constants, expo-font, expo-haptics, expo-image, expo-linking, expo-splash-screen, expo-status-bar, expo-web-browser

### Development Notes
- Currently uses XRP Testnet (switchable to Mainnet)
- XUMM API key is client-side for MVP (should move to backend for production)
- AdMob integration is placeholder/future implementation