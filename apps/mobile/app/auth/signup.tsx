import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function SignupScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { signUp } = useAuth();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
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
            Alert.alert('Signup Failed', 'Could not create account');
            setLoading(false);
        } else {
            Alert.alert('Success', 'Account created! Logging you in...', [
                { text: 'OK', onPress: () => router.replace('/auth/login') }
            ]);
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
                        secureTextEntry={!showPassword}
                        left={<TextInput.Icon icon="lock-check-outline" />}
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
