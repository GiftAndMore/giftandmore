import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setLoading(true);
        // Mock success
        setTimeout(() => {
            Alert.alert('Check Email', 'We sent a password reset link to your email.');
            setLoading(false);
            router.replace('/auth/login');
        }, 1000);
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
                        <Text variant="headlineMedium" style={styles.appName}>Recover Access</Text>
                        <Text variant="bodyMedium" style={{ color: '#E9D5FF' }}>Enter your email to reset password</Text>
                    </View>
                </View>

                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
                    <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                        We'll send you a link to your email to help you recover your account.
                    </Text>

                    <TextInput
                        label="Email Address"
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

                    <Button
                        mode="contained"
                        onPress={handleReset}
                        loading={loading}
                        disabled={loading}
                        style={[styles.resetBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Send Reset Link
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => router.replace('/auth/login')}
                        style={{ marginTop: 10 }}
                        labelStyle={{ color: theme.colors.primary }}
                    >
                        Return to Login
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
    },
    description: { textAlign: 'center', marginBottom: 20 },
    input: { marginBottom: 20 },
    resetBtn: { borderRadius: 12 },
});
