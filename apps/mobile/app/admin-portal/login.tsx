import { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAdminAuth } from '../../lib/admin-auth';
import { useRouter } from 'expo-router';

export default function AdminLoginScreen() {
    const [email, setEmail] = useState('user@admin.com');
    const [password, setPassword] = useState('Admin');
    const [loading, setLoading] = useState(false);
    const [errorDialog, setErrorDialog] = useState({ visible: false, title: '', message: '' });
    const { signInAdmin } = useAdminAuth();
    const theme = useTheme();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorDialog({ visible: true, title: 'Error', message: 'Please enter email and password' });
            return;
        }

        setLoading(true);
        try {
            const { mockStore } = require('../../lib/mock-api');
            const user = await mockStore.verifyCredentials(email, password);

            if (!user) {
                setErrorDialog({ visible: true, title: 'Login Failed', message: 'Invalid credentials' });
                setLoading(false);
                return;
            }

            if (user.role !== 'admin') {
                setErrorDialog({ visible: true, title: 'Access Denied', message: 'This portal is for Administrators only.' });
                setLoading(false);
                return;
            }

            const { error } = await signInAdmin(email, password);
            if (error) {
                setErrorDialog({ visible: true, title: 'Login Failed', message: error || 'Invalid credentials' });
            } else {
                router.replace('/admin-portal/(tabs)');
            }
        } catch (e) {
            setErrorDialog({ visible: true, title: 'Error', message: 'An unexpected error occurred' });
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

            <Portal>
                <Dialog visible={errorDialog.visible} onDismiss={() => setErrorDialog({ ...errorDialog, visible: false })} style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}>
                    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                        <MaterialCommunityIcons
                            name={errorDialog.title.toLowerCase().includes('failed') || errorDialog.title.toLowerCase().includes('error') || errorDialog.title.toLowerCase().includes('denied') ? "alert-circle" : "check-circle"}
                            size={48}
                            color={errorDialog.title.toLowerCase().includes('failed') || errorDialog.title.toLowerCase().includes('error') || errorDialog.title.toLowerCase().includes('denied') ? theme.colors.error : theme.colors.primary}
                        />
                        <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 10 }}>
                            {errorDialog.title}
                        </Dialog.Title>
                        <Dialog.Content>
                            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
                                {errorDialog.message}
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions style={{ justifyContent: 'center', width: '100%', paddingBottom: 10 }}>
                            <Button
                                mode="contained"
                                onPress={() => setErrorDialog({ ...errorDialog, visible: false })}
                                style={{ borderRadius: 20, paddingHorizontal: 20 }}
                                buttonColor={theme.colors.primary}
                            >
                                OK
                            </Button>
                        </Dialog.Actions>
                    </View>
                </Dialog>
            </Portal>
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
