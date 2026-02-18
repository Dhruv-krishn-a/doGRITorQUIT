# Architecture of the `apps/mobile` folder

The `apps/mobile` folder contains the project's mobile application, built using React Native and Expo. It provides a native experience for users to manage their productivity while on the go, utilizing shared project logic and data structures.

## File and Directory Descriptions

- **`app/`**: Contains the Expo Router structure, defining the application's file-based navigation for auth, main, and drawer-based routes.
- **`assets/`**: Stores static assets such as images, icons, and splash screens.
- **`components/`**: Modular React Native UI components, including custom navigation elements like `CustomDrawerContent`.
- **`context/`**: Manages application-wide state, such as `AuthContext` for user session and authentication status.
- **`services/`**: Integration logic for connecting the mobile app to backend APIs and Supabase.
- **`db/`**: Mobile-specific data management, potentially including local persistence or caching strategies.
- **`lib/`**: Common utility functions and shared library integrations for the mobile platform.
- **`app.json`**: Expo-specific configuration for building and deploying the mobile application.
- **`metro.config.js`**: Metro bundler configuration for React Native.
- **`tailwind.config.js`**: Tailwind CSS configuration (likely using NativeWind) for mobile styling.

## Interactions and Communication

- **Internal Packages**: The mobile app imports shared packages like `@planner/api` for input validation and `@planner/config` for system-wide constants.
- **Authentication**: Uses `AuthContext` and Supabase for user authentication and session persistence.
- **API Integration**: Connects to the platform's backend services via standard API calls, ensuring data consistency with the web and CMS applications.
- **Styling**: Leverages NativeWind (Tailwind for React Native) to provide a familiar styling experience consistent with the web application's CSS.
