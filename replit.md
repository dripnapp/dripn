# Drip'n - Crypto Rewards App

## Overview

A React Native Expo mobile application that functions as a crypto rewards platform. Users earn drips (the in-app currency) by completing micro-tasks (watching rewarded video ads, AdMob, offerwalls, and sharing). Drips are used for in-app level progression and achievements.

The app is non-custodial and focuses on providing an engaging rewards experience through various ad networks and social sharing.

**Tagline:** "every drip counts"

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **APP STORE COMPLIANCE**: Removed all cryptocurrency wallet features, Xaman integration, and XRP price tracking to comply with App Store regulations regarding money transfers.
- Rebranded the app to focus on in-app rewards and level progression rather than financial payouts.
- Removed "Connect Wallet", "Cashout", and "Disconnect Wallet" functionalities.
- Cleaned up the main dashboard to remove XRP price and wallet-related UI elements.
- **MAJOR REBRAND**: Changed app name from "droply.io" to "Drip'n"
- Changed all "drops" references to "drips" throughout the app
- Updated logo with new Drip'n branding (assets/images/dripn-logo.jpg)
- Updated splash screen with animated "Loading..." text
- Added Instagram as share option alongside X, Facebook, and Text/SMS
- Updated X (Twitter) share button with proper X icon and black background
- Created History page for tracking rewards and level milestones
- Added totalEarned tracking for leaderboard (separate from current balance)
- Updated contact email to dripnapp@proton.me
- Updated referral code prefix from "DPLY-" to "DRPN-"
- **NAVIGATION UPDATE**: Created shared AppHeader component with hamburger menu visible on ALL pages
- Lowered header position (50px top padding) for better mobile accessibility

### Share Task Features
- Anti-abuse measures: 3x daily limit, 1-minute cooldown between shares
- Share rewards: 1 drip (first), 1 drip (second), 3 drips (third) = 5 drips max per day
- Share options: X (Twitter), Facebook, Instagram, or Text/SMS

### Reward System
- Standard ads: 10-15s duration, 1-2 drips reward
- Premium ads: 20-30s duration, 3-4 drips reward
- AdMob, AdGem, and BitLabs integrations for additional drip earning opportunities

### History Page Features
- View available drips balance
- View total earned drips (lifetime)
- Recent activity list with source, date, and amount
- Total earned used for leaderboard ranking and level progression

### Logo Notes
- Custom logo PNG provided by user (gradient water drop with play button + "drip'n" text)
- Logo saved as `assets/images/dripn-logo.jpg`
- Header and splash screen use the same logo with dark background (#12122a)

### Previous Changes
- Implemented one-time acknowledgment popup with checkboxes (18+, risks, terms)
- Created step-by-step onboarding tutorial for first-time users
- Added hamburger menu with navigation to all app sections
- Created dedicated screens: Learn, Legal, Terms, Referral, Badges, Leaderboard, History
- Added user levels (Bronze, Silver, Gold) and badge system with rewards
- Added referral program with unique codes and input for entering codes
- Added unique username system for user profiles (shown on leaderboard)

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router with file-based routing (routes defined in `/app` directory)
- **State Management**: Zustand with persistence middleware for global app state
- **Storage**: AsyncStorage for persisting onboarding state and user data
- **UI Components**: Custom themed components with light/dark mode support

### App Screens (in `/app` directory)
- `index.tsx` - Main dashboard with balance, tasks (video, offerwalls, share)
- `history.tsx` - History page with rewards and total earned tracking
- `settings.tsx` - User settings (username, theme selection)
- `contact.tsx` - Contact/support page with email link
- `learn.tsx` - Crypto basics and app education
- `legal.tsx` - Legal disclaimers and disclosures
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
- **Acknowledgment Popup**: Required checkboxes for age, risks, and terms
- **Drips System**: Rewards currency for in-app achievements
- **Levels & Badges**: Bronze (100 drips), Silver (500 drips), Gold (1000 drips)
- **Referral Program**: 10% of referee earnings for 30 days, codes prefixed with "DRPN-"
- **History Tracking**: All rewards logged with timestamps

### State Management Pattern
The app uses Zustand store (`src/store/useStore.ts`) with the following state:
- Drips balance and daily earnings tracking
- Total earned tracking (lifetime, for leaderboard)
- History records for rewards
- Onboarding completion status
- Terms acceptance status
- User level (Bronze/Silver/Gold)
- Badges collection
- Referral code and count
- Persistence to AsyncStorage for session continuity

### Security Considerations
- Daily earning caps (500 drips/day) to prevent abuse
- Required acknowledgment checkboxes before accessing tasks
- Age verification (18+)
- Clear legal disclaimers throughout app

## External Dependencies

### Reward Networks
- **react-native-google-mobile-ads**: AdMob rewarded video ads
- **react-native-webview**: Hosting offerwall providers like AdGem and BitLabs

### Storage & Data
- **@react-native-async-storage/async-storage**: Local device storage for persisting user data
- **zustand**: Lightweight state management with persistence middleware

### HTTP & Networking
- **axios**: HTTP client for API requests

### UI & Navigation
- **expo-router**: File-based routing system
- **@expo/vector-icons**: Icon library (MaterialCommunityIcons)

### Expo Modules
- expo-constants, expo-font, expo-linking, expo-splash-screen, expo-status-bar, expo-web-browser
