import { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useAdminAuth } from '../../lib/admin-auth';
import { useRouter } from 'expo-router';

export default function AdminLoginScreen() {
    const [email, setEmail] = useState('user@admin.com');
    const [password, setPassword] = useState('Admin');
    const [loading, setLoading] = useState(false);
    const { signInAdmin } = useAdminAuth();
    const theme = useTheme();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signInAdmin(email, password);
            if (error) {
                Alert.alert('Login Failed', error);
            } else {
                // Navigation handled by layout effect
            }
        } catch (e) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.primary, textAlign: 'center' }}>
                    Admin Portal
                </Text>
                <Text variant="bodyMedium" style={{ marginBottom: 24, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                    Authorized Personnel Only
                </Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    autoCapitalize="none"
                    textColor={theme.colors.onSurface}
                />

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.button}
                    contentStyle={{ height: 50 }}
                >
                    Login
                </Button>

                <Button
                    mode="text"
                    onPress={() => {
                        if (router.canDismiss()) {
                            router.dismissAll();
                        }
                        router.replace('/auth/login');
                    }}
                    style={{ marginTop: 20 }}
                >
                    Back to User App
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        padding: 30,
        borderRadius: 20,
        elevation: 4,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
    }
});
