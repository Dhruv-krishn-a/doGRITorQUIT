module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?(jest-expo|expo|@expo|expo-modules-core|react-native|@react-native|@nozbe/watermelondb|nativewind|react-native-css-interop|lucide-react-native)/)',
  ],
};
