import { Slot, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';
import { CartProvider } from '../lib/CartContext';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from '../lib/theme';
import { ThemeProvider, useThemeContext } from '../lib/ThemeContext';

// Tell expo-router that (tabs) is the default route group
export const unstable_settings = {
    initialRouteName: '(tabs)',
};

function RootLayoutNav() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    return <Slot />;
}

import { AdminAuthProvider } from '../lib/admin-auth';
import { FeedbackProvider } from '../lib/FeedbackContext';

// ...

function RootLayoutContent() {
    const { themeMode } = useThemeContext();
    const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

    return (
        <PaperProvider theme={currentTheme}>
            <AuthProvider>
                <CartProvider>
                    <AdminAuthProvider>
                        <FeedbackProvider>
                            <View style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
                                <RootLayoutNav />
                            </View>
                        </FeedbackProvider>
                    </AdminAuthProvider>
                </CartProvider>
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
