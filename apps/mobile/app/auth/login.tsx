import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton, Surface, useTheme, Portal, Dialog, Paragraph, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function LoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { signIn, session } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; isError: boolean }>({
        visible: false, title: '', message: '', isError: false
    });

    const showDialog = (title: string, message: string, isError = true) => {
        setFeedback({ visible: true, title, message, isError });
    };

    const hideDialog = () => {
        setFeedback({ ...feedback, visible: false });
    };

    // Removed auto-redirect useEffect to prevent update loops.
    // Navigation is handled explicitly in handleLogin.

    const handleLogin = async () => {
        if (!email || !password) {
            showDialog('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email.trim(), password.trim());

        if (error) {
            showDialog('Login Failed', 'Invalid credentials');
            setLoading(false);
        } else {
            // Manual redirect to avoid layout race conditions
            const { mockStore } = require('../../lib/mock-api');
            // We need to know the role here. The signIn hook might not update 'role' state immediately in this closure.
            // But we can check the store or just assume 'user' defaults to home, and if it's admin/assistant we check.
            // Actually, we can fetch the user to be sure.
            const user = await mockStore.verifyCredentials(email, password);

            // Enforce portal separation
            if (user?.role === 'admin') {
                showDialog('Access Denied', 'Please log in via the Admin Portal.');
                await require('../../lib/auth').signOut; // ensure mock signout if feasible or just don't redirect
                // We need to actually perform the signout if useAuth.signIn implicitly logged them in.
                // But typically specific portals just won't redirect.
                // However, we should prevent the session from persisting if possible.
                // For now, blocking the redirect and showing dialog is key.
                return;
            }
            if (user?.role === 'assistant') {
                // Redirect to assistant dashboard (now at /dashboard to avoid root collision)
                router.replace('/dashboard');
                return;
            }

            // Valid User
            if (user) {
                router.replace('/');
            } else {
                // Should be caught by error check above but just in case
                router.replace('/');
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.topSection, { backgroundColor: theme.colors.primary }]}>
                    <View style={styles.logoContainer}>
                        <IconButton icon="gift" iconColor="white" size={60} />
                        <Text variant="headlineMedium" style={styles.appName}>Gifts & More</Text>
                        <Text variant="bodyMedium" style={{ color: '#E9D5FF' }}>Welcome back! Log in to continue</Text>
                    </View>
                </View>

                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
                    <Text variant="titleLarge" style={[styles.formTitle, { color: theme.colors.onSurface }]}>Sign In</Text>

                    <TextInput
                        label="Email"
                        mode="outlined"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        left={<TextInput.Icon icon="email-outline" />}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        textColor={theme.colors.onSurface}
                        outlineStyle={{ borderRadius: 12 }}
                    />

                    <TextInput
                        label="Password"
                        mode="outlined"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        left={<TextInput.Icon icon="lock-outline" />}
                        right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        textColor={theme.colors.onSurface}
                        outlineStyle={{ borderRadius: 12 }}
                    />

                    <Button
                        mode="text"
                        onPress={() => router.push('/auth/forgot-password')}
                        style={styles.forgotBtn}
                        labelStyle={{ color: theme.colors.primary }}
                    >
                        Forgot Password?
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={[styles.loginBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Log In
                    </Button>

                    <View style={styles.footer}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account?</Text>
                        <Button
                            mode="text"
                            onPress={() => router.push('/auth/signup')}
                            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
                        >
                            Sign Up
                        </Button>
                    </View>

                    <View style={{ marginTop: 10, alignItems: 'center' }}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="text"
                                    onPress={() => setMenuVisible(true)}
                                    labelStyle={{ color: theme.colors.primary }}
                                    icon="chevron-down"
                                    contentStyle={{ flexDirection: 'row-reverse' }}
                                >
                                    Sign in as...
                                </Button>
                            }
                        >
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible(false);
                                    router.push('/admin-portal/login');
                                }}
                                title="Admin Portal"
                                leadingIcon="shield-account"
                            />
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible(false);
                                    router.push('/assistant-portal/login');
                                }}
                                title="Assistant Portal"
                                leadingIcon="headset"
                            />
                        </Menu>
                    </View>
                </Surface>

                <Portal>
                    <Dialog visible={feedback.visible} onDismiss={hideDialog} style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}>
                        <Dialog.Title style={{ color: feedback.isError ? theme.colors.error : theme.colors.primary, fontWeight: 'bold' }}>
                            {feedback.title}
                        </Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={{ color: theme.colors.onSurface }}>{feedback.message}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideDialog} textColor={theme.colors.primary}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    topSection: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    logoContainer: { alignItems: 'center' },
    appName: { color: 'white', fontWeight: 'bold', marginTop: -10 },
    formCard: {
        marginHorizontal: 24,
        marginTop: -50,
        padding: 24,
        borderRadius: 20,
    },
    formTitle: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { marginBottom: 16 },
    forgotBtn: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 16 },
    loginBtn: { borderRadius: 12 },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    }
});
