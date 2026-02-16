import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#6D28D9",
        secondary: "#F59E0B",
        background: "#F9FAFB",
        surface: "#FFFFFF",
    },
    roundness: 16,
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: "#A78BFA",
        secondary: "#FBBF24",
        background: "#0F172A",
        surface: "#1E293B",
        surfaceVariant: "#334155",
        onSurface: "#FFFFFF",
        onSurfaceVariant: "#E2E8F0",
        onBackground: "#FFFFFF",
        outline: "#475569",
        outlineVariant: "#334155",
        primaryContainer: "#4C1D95",
        onPrimaryContainer: "#EDE9FE",
    },
    roundness: 16,
};
