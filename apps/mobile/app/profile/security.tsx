import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Appbar, Surface, HelperText, useTheme, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SecuritySettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { updatePassword } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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


    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            // In a real app, we would re-authenticate with currentPassword first
            const { error } = await updatePassword(data.newPassword);

            if (error) throw error;

            showDialog('Success', 'Your password has been updated successfully.', false, () => router.push('/(tabs)/profile'));
            reset();
        } catch (err: any) {
            showDialog('Error', 'Failed to update password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Button icon="arrow-left" textColor="white" onPress={() => router.push('/(tabs)/profile')} style={{ minWidth: 0, padding: 0, margin: 0 }}>{''}</Button>
                    <Text variant="headlineSmall" style={{ color: 'white', fontWeight: 'bold' }}>Security Settings</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Change Password</Text>

                    <Controller
                        control={control}
                        name="currentPassword"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Current Password"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                secureTextEntry={!showCurrentPassword}
                                right={<TextInput.Icon icon={showCurrentPassword ? "eye-off" : "eye"} onPress={() => setShowCurrentPassword(!showCurrentPassword)} />}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.currentPassword}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.currentPassword}>
                        {errors.currentPassword?.message}
                    </HelperText>

                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="New Password"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                secureTextEntry={!showNewPassword}
                                right={<TextInput.Icon icon={showNewPassword ? "eye-off" : "eye"} onPress={() => setShowNewPassword(!showNewPassword)} />}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.newPassword}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.newPassword}>
                        {errors.newPassword?.message}
                    </HelperText>

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Confirm New Password"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                secureTextEntry={!showConfirmPassword}
                                right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.confirmPassword}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.confirmPassword}>
                        {errors.confirmPassword?.message}
                    </HelperText>

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Update Password
                    </Button>
                </Surface>
            </ScrollView>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingHorizontal: 8,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4
    },
    content: { padding: 20 },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 20 },
    input: { marginBottom: 2 },
    inputOutline: { borderRadius: 12 },
    button: { borderRadius: 12, marginTop: 10 },
});
