/// <reference types="nativewind/types" />

// Add this to fix 'process' errors and get autocomplete!
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    // Add other keys here if needed
    [key: string]: string | undefined;
  }
}
import 'react-native';

declare module 'react-native' {
  interface ViewProps { className?: string; }
  interface TextProps { className?: string; }
  interface TextInputProps { className?: string; }
  interface ImageProps { className?: string; }
  interface TouchableOpacityProps { className?: string; }
  interface PressableProps { className?: string; }
  interface ScrollViewProps { className?: string; }
  interface FlatListProps<ItemT> { className?: string; }
}
