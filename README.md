# PerDiem - Restaurant Reservation & Store Hours App

A modern React Native mobile application that helps users check restaurant/store hours, make reservations, and manage their dining preferences with intelligent timezone handling and real-time store status updates.

## 🍽️ What is PerDiem?

PerDiem is a comprehensive restaurant and store management app that provides users with:

- **Real-time Store Hours**: Check current and future store operating hours
- **Smart Reservations**: Book time slots based on meal types (Breakfast, Lunch, Dinner)
- **Timezone Intelligence**: Automatic timezone conversion for global users
- **Store Overrides**: Handle special hours, closures, and holiday schedules
- **Push Notifications**: Get notified about store openings and reservation reminders
- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations

## 🚀 Key Features

### 📅 Dynamic Date Selection

- 4-day quick selection cards
- Full calendar view with store status indicators
- Future-only date selection
- Visual open/closed status indicators

### ⏰ Intelligent Time Slot Management

- 30-minute reservation intervals
- Meal-type based time ranges (Breakfast: 6AM-12PM, Lunch: 12PM-6PM, Dinner: 6PM-12AM)
- Real-time availability checking
- Future-only time slot filtering

### 🌍 Advanced Timezone Handling

- Automatic timezone detection
- Store hours display in user's local timezone
- Time slots always in store's local timezone (NY)
- Seamless timezone switching

### 🔔 Smart Notifications

- Store opening reminders (1 hour before)
- Test notification system
- Permission management

### 🏪 Store Override System

- Special hours for holidays
- Temporary closures
- Modified operating hours

## 🛠️ Technology Stack

### **Frontend Framework**

- **React Native 0.80.2** - Cross-platform mobile development
- **TypeScript 5.0.4** - Type-safe JavaScript development

### **State Management**

- **Redux Toolkit 2.8.2** - Modern Redux with simplified patterns
- **Redux Persist 6.0.0** - Persistent state storage
- **React Redux 9.2.0** - React bindings for Redux

### **Navigation**

- **React Navigation 7.1.16** - Native navigation
- **Native Stack Navigator** - Stack-based navigation
- **Navigation Service** - Centralized navigation management

### **UI Components & Animations**

- **@gorhom/bottom-sheet 5.1.8** - Modal bottom sheets
- **React Native Gesture Handler 2.27.2** - Touch gestures
- **React Native Reanimated 4.0.1** - Smooth animations
- **React Native Calendars 1.1313.0** - Calendar component

### **Date & Time Handling**

- **date-fns 4.1.0** - Modern date utility library
- **date-fns-tz 3.2.0** - Timezone support
- **Intl.DateTimeFormat** - Native timezone formatting

### **Authentication & Backend**

- **Firebase Auth 22.4.0** - User authentication
- **Google Sign-In 15.0.0** - Social authentication
- **AsyncStorage 2.2.0** - Local data persistence

### **Notifications**

- **@notifee/react-native 9.1.8** - Local push notifications
- **React Native Toast Message 2.3.3** - Toast notifications

### **Development Tools**

- **ESLint** - Code linting with React Native rules
- **Prettier 2.8.8** - Code formatting
- **Jest 29.6.3** - Testing framework
- **@testing-library/react-native** - Component testing

## 🏗️ Architecture Overview

### **Component Structure**

```
src/
├── components/          # Reusable UI components
│   ├── DateSelector/   # Date selection with 4-day cards
│   ├── TimeSlotSelector/ # Time slot grid with meal types
│   ├── MealTypeSelector/ # Breakfast/Lunch/Dinner selector
│   ├── CalendarBottomSheet/ # Modal calendar component
│   └── Header/         # App header with logout
├── screens/            # Main app screens
│   ├── HomeScreen/     # Main dashboard
│   └── auth/           # Authentication screens
├── services/           # API and external services
│   ├── storeService/   # Store hours and overrides API
│   ├── authService/    # Firebase authentication
│   └── notificationService/ # Push notifications
├── store/              # Redux state management
│   ├── authSlice/      # Authentication state
│   ├── storeSlice/     # Store data state
│   └── notificationSlice/ # Notification state
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── timezoneUtils/  # Timezone conversion logic
│   └── storeUtils/     # Store data processing
└── navigation/         # Navigation configuration
```

### **Data Flow**

1. **Store Data Fetching**: `useStoreTimes` hook fetches store hours and overrides
2. **Timezone Processing**: `timezoneUtils` handles timezone conversions
3. **State Management**: Redux stores processed data with loading states
4. **UI Rendering**: Components display data with proper timezone handling
5. **User Interactions**: Date/time selections trigger state updates

### **Key Design Patterns**

- **Custom Hooks**: Encapsulate business logic (`useStoreTimes`, `useTimezone`)
- **Memoization**: Optimize performance with `useMemo` and `useCallback`
- **Error Boundaries**: Graceful error handling with retry mechanisms
- **Component Composition**: Reusable components with clear interfaces

## 📱 Getting Started

> **Note**: Make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Step 1: Install Dependencies

```sh
# Install Node.js dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && bundle install && bundle exec pod install && cd ..
```

### Step 2: Start Metro Bundler

```sh
# Start the Metro development server
npm start
```

### Step 3: Run the App

#### Android

```sh
# Start Android emulator or connect device, then run:
npm run android
```

#### iOS (macOS only)

```sh
# Start iOS simulator or connect device, then run:
npm run ios
```

## 🧪 Testing

```sh
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🔧 Development

### Code Quality

```sh
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

### Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🌐 API Integration

The app integrates with the following APIs:

- **Store Hours API**: `https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-times/`
- **Store Overrides API**: `https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-overrides/`
- **Firebase**: Authentication and user management

## 🔒 Environment Setup

Create a `.env` file in the root directory for environment variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id

# API Endpoints
STORE_TIMES_API=https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-times/
STORE_OVERRIDES_API=https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-overrides/
```
