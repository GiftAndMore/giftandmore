import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AdminAuthProvider, useAdminAuth } from '../../lib/admin-auth';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { useThemeContext } from '../../lib/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

function AdminLayoutNav() {
    const { adminSession, loading } = useAdminAuth();
    const router = useRouter();
    const segments = useSegments() as string[];

    useEffect(() => {
        if (loading) return;

        // Ensure we are in the admin group; otherwise, allow navigation out
        if (segments[0] !== 'admin-portal') return;

        // Since the folder is now "admin-portal", checking segments[1] === 'login' covers /admin-portal/login
        const inAdminLogin = segments.length > 1 && segments[1] === 'login';

        if (!adminSession && !inAdminLogin) {
            // Redirect to admin login if not authenticated
            router.replace('/admin-portal/login');
        } else if (adminSession && inAdminLogin) {
            // Redirect to dashboard if already logged in
            router.replace('/admin-portal/(tabs)');
        }
    }, [adminSession, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    return <Slot />;
}

export default function AdminLayout() {
    // We can reuse the main theme or force light theme for admin
    const { themeMode } = useThemeContext();
    const theme = themeMode === 'dark' ? darkTheme : lightTheme;

    return (
        <AdminAuthProvider>
            <PaperProvider theme={theme}>
                <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    <AdminLayoutNav />
                </View>
            </PaperProvider>
        </AdminAuthProvider>
    );
}
