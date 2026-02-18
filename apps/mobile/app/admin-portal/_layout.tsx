import { Slot } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AdminAuthProvider, useAdminAuth } from '../../lib/admin-auth';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '../../lib/ThemeContext';
import { lightTheme, darkTheme } from '../../lib/theme';

function AdminLayoutNav() {
    const { adminSession, loading } = useAdminAuth();

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
