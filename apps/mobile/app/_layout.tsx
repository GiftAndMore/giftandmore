import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from './theme';
import { useEffect } from 'react';
import { ThemeProvider, useThemeContext } from '../lib/ThemeContext';

function RootLayoutNav() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === 'auth';
        const isGuestAllowed = segments[0] === 'custom-request' || segments[0] === 'chat' || segments[0] === 'gift-finder' || segments[0] === 'product' || segments[0] === 'admin-portal';

        if (!session && !inAuthGroup && !isGuestAllowed) {
            router.replace('/auth/login');
        } else if (session && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    return <Slot />;
}

function RootLayoutContent() {
    const { themeMode } = useThemeContext();
    const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

    return (
        <PaperProvider theme={currentTheme}>
            <AuthProvider>
                <View style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
                    <RootLayoutNav />
                </View>
            </AuthProvider>
        </PaperProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    );
}
