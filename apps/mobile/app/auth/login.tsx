import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function LoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);

        if (error) {
            Alert.alert('Login Failed', 'Invalid credentials');
            setLoading(false);
        } else {
            router.replace('/(tabs)');
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

                    <Button
                        mode="text"
                        onPress={() => router.push('/admin-portal/login')}
                        style={{ marginTop: 0 }}
                        labelStyle={{ color: theme.colors.primary }}
                    >
                        Admin Portal
                    </Button>
                </Surface>
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
