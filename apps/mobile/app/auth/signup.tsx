import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, IconButton, useTheme, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function SignupScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { signUp, signIn } = useAuth();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; isError: boolean; onDismiss?: () => void }>({
        visible: false, title: '', message: '', isError: false
    });

    const showDialog = (title: string, message: string, isError = true, onDismiss?: () => void) => {
        setFeedback({ visible: true, title, message, isError, onDismiss });
    };

    const hideDialog = () => {
        const callback = feedback.onDismiss;
        setFeedback({ ...feedback, visible: false, onDismiss: undefined });
        if (callback) callback();
    };

    const handleSignup = async () => {
        if (!fullName || !username || !email || !password || !confirmPassword) {
            showDialog('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            showDialog('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        const { error } = await signUp({
            email,
            password,
            full_name: fullName,
            username: username,
        });

        if (error) {
            showDialog('Signup Failed', error.message || 'Could not create account');
            setLoading(false);
        } else {
            // Account created — now sign in (same pattern as login screen)
            const { error: loginError } = await signIn(email, password);
            setLoading(false);
            if (loginError) {
                showDialog('Error', 'Account created but login failed. Please use the login screen.');
            } else {
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
                    <IconButton
                        icon="arrow-left"
                        iconColor="white"
                        size={24}
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    />
                    <View style={styles.logoContainer}>
                        <Text variant="headlineMedium" style={styles.appName}>Join Us</Text>
                        <Text variant="bodyMedium" style={{ color: '#E9D5FF' }}>Create an account to start ordering gifts</Text>
                    </View>
                </View>

                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
                    <Text variant="titleLarge" style={[styles.formTitle, { color: theme.colors.onSurface }]}>Sign Up</Text>

                    <TextInput
                        label="Full Name"
                        mode="outlined"
                        value={fullName}
                        onChangeText={setFullName}
                        left={<TextInput.Icon icon="account-outline" />}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        textColor={theme.colors.onSurface}
                        outlineStyle={{ borderRadius: 12 }}
                    />

                    <TextInput
                        label="Username"
                        mode="outlined"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="at" />}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        textColor={theme.colors.onSurface}
                        outlineStyle={{ borderRadius: 12 }}
                    />

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

                    <TextInput
                        label="Confirm Password"
                        mode="outlined"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword} // Bug fix: previously used !showPassword
                        left={<TextInput.Icon icon="lock-check-outline" />}
                        right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        textColor={theme.colors.onSurface}
                        outlineStyle={{ borderRadius: 12 }}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={loading}
                        style={[styles.signupBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Create Account
                    </Button>

                    <View style={styles.footer}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Already have an account?</Text>
                        <Button
                            mode="text"
                            onPress={() => router.replace('/auth/login')}
                            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
                        >
                            Log In
                        </Button>
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
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: { position: 'absolute', top: 40, left: 10 },
    logoContainer: { alignItems: 'center' },
    appName: { color: 'white', fontWeight: 'bold' },
    formCard: {
        marginHorizontal: 24,
        marginTop: -50,
        padding: 24,
        borderRadius: 20,
        marginBottom: 40,
    },
    formTitle: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { marginBottom: 16 },
    signupBtn: { borderRadius: 12, marginTop: 10 },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    }
});
