import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAdminAuth } from '../../lib/admin-auth';
import { useRouter } from 'expo-router';

export default function AssistantLoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorDialog, setErrorDialog] = useState({ visible: false, title: '', message: '' });
    const { signInAdmin } = useAdminAuth(); // Reusing the hook for auth logic
    const theme = useTheme();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorDialog({ visible: true, title: 'Error', message: 'Please enter email and password' });
            return;
        }

        setLoading(true);
        try {
            // First verify credentials to check role BEFORE signing in officially if possible,
            // or sign in then check. Here we sign in via hook (which hits mockStore eventually).
            // But we need custom role check.
            const { mockStore } = require('../../lib/mock-api');
            const user = await mockStore.verifyCredentials(email, password);

            if (!user) {
                setErrorDialog({ visible: true, title: 'Login Failed', message: 'Invalid credentials' });
                setLoading(false);
                return;
            }

            if (user.role !== 'assistant') {
                setErrorDialog({ visible: true, title: 'Access Denied', message: 'This portal is for Assistants only.' });
                setLoading(false);
                return;
            }

            // Proceed with actual sign in
            const { error } = await signInAdmin(email.trim(), password.trim());
            if (error) {
                setErrorDialog({ visible: true, title: 'Login Failed', message: error });
            } else {
                // Auto-set online status
                await mockStore.setAvailability(user.id, 'online');
                // Explicit navigation to new dashboard route
                router.replace('/dashboard');
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
                    Assistance Portal
                </Text>
                <Text variant="bodyMedium" style={{ marginBottom: 24, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                    Virtual Assistants Login
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
                    secureTextEntry={!showPassword}
                    right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
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
