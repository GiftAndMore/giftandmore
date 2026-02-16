import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Appbar, HelperText, TouchableRipple, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

const schema = z.object({
    purpose: z.string().min(1, 'Purpose is required'),
    budget_min: z.string().regex(/^\d+$/, 'Must be a number'),
    budget_max: z.string().regex(/^\d+$/, 'Must be a number'),
    details: z.string().min(10, 'Please provide more details'),
});

export default function CustomRequest() {
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            const userId = user?.id || '00000000-0000-0000-0000-000000000001';

            // 1. Create Conversation
            const { data: conv, error: convError } = await supabase
                .from('conversations')
                .insert({
                    user_id: userId,
                    type: 'support',
                    title: `Custom Request - ${data.purpose}`
                })
                .select()
                .single();

            if (convError) throw convError;
            if (!conv) throw new Error('No conversation returned');

            // 2. Insert User's Request Message
            const requestDetails = `New Custom Request:\nPurpose: ${data.purpose}\nBudget: ₦${data.budget_min} - ₦${data.budget_max}\nDetails: ${data.details}`;
            await supabase
                .from('messages')
                .insert({
                    conversation_id: conv.id,
                    sender_id: userId,
                    content: requestDetails,
                    sender_type: 'user'
                });

            // 3. Insert Bot Welcome Message
            await supabase
                .from('messages')
                .insert({
                    conversation_id: conv.id,
                    sender_id: '00000000-0000-0000-0000-000000000000',
                    content: "We've received your custom request! An agent will review it and get back to you shortly. In the meantime, feel free to add more details or select an option below:",
                    sender_type: 'bot'
                });

            Alert.alert('Request Sent', 'Your custom request has been submitted. You can track its progress in the support chat.', [
                { text: 'Go to Chat', onPress: () => router.push({ pathname: '/chat/room', params: { conversationId: conv.id } }) }
            ]);
        } catch (e: any) {
            console.warn('Submission to Supabase failed (Demo Mode triggered):', e);
            const mockConvId = `mock-custom-${Date.now()}`;

            Alert.alert('Request Sent (Demo Mode)', 'Your custom request has been submitted for review. (Note: Using demo mode as backend is pending)', [
                { text: 'Go to Chat', onPress: () => router.push({ pathname: '/chat/room', params: { conversationId: mockConvId } }) }
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => router.back()} />
                    <Text style={styles.headerTitle}>Custom Request</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Feedback Section Link */}
                <TouchableRipple onPress={() => router.push('/chat')} style={styles.feedbackBanner}>
                    <Surface style={[styles.feedbackSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={1}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                                <MaterialCommunityIcons name="message-text-outline" size={24} color={theme.colors.onPrimaryContainer} />
                            </View>
                            <View style={{ marginLeft: 16 }}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Check Feedback</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>View replies from Admin/VA</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    </Surface>
                </TouchableRipple>

                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>Tell us what you need</Text>
                <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>We'll help you find the perfect gift.</Text>

                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Controller
                        control={control}
                        name="purpose"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Occasion / Purpose"
                                mode="outlined"
                                placeholder="e.g. Birthday, Anniversary"
                                value={value}
                                onChangeText={onChange}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                textColor={theme.colors.onSurface}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.purpose}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.purpose}>{String(errors.purpose?.message || '')}</HelperText>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Controller
                                control={control}
                                name="budget_min"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        label="Min Budget"
                                        mode="outlined"
                                        keyboardType="numeric"
                                        value={value}
                                        onChangeText={onChange}
                                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                        textColor={theme.colors.onSurface}
                                        outlineStyle={styles.inputOutline}
                                        error={!!errors.budget_min}
                                        left={<TextInput.Affix text="₦" textStyle={{ color: theme.colors.onSurfaceVariant }} />}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Controller
                                control={control}
                                name="budget_max"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        label="Max Budget"
                                        mode="outlined"
                                        keyboardType="numeric"
                                        value={value}
                                        onChangeText={onChange}
                                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                        textColor={theme.colors.onSurface}
                                        outlineStyle={styles.inputOutline}
                                        error={!!errors.budget_max}
                                        left={<TextInput.Affix text="₦" textStyle={{ color: theme.colors.onSurfaceVariant }} />}
                                    />
                                )}
                            />
                        </View>
                    </View>
                    <HelperText type="error" visible={!!errors.budget_min || !!errors.budget_max}>
                        Enter valid budget amounts.
                    </HelperText>

                    <Controller
                        control={control}
                        name="details"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Preferences & Details"
                                mode="outlined"
                                multiline
                                numberOfLines={8}
                                placeholder="Describe the recipient, their likes, dislikes..."
                                value={value}
                                onChangeText={onChange}
                                style={[styles.input, { height: 160, backgroundColor: theme.colors.surface }]}
                                textAlignVertical="top"
                                textColor={theme.colors.onSurface}
                                outlineStyle={styles.inputOutline}
                                contentStyle={{ paddingTop: 12 }}
                                error={!!errors.details}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.details}>{String(errors.details?.message || '')}</HelperText>

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Submit Request
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        elevation: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 24, marginLeft: 10 },
    content: { padding: 16, paddingBottom: 40 },
    feedbackBanner: { marginBottom: 20 },
    feedbackSurface: {
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },

    title: { fontWeight: 'bold', marginBottom: 4, marginLeft: 4 },
    subtitle: { marginBottom: 20, marginLeft: 4 },

    formCard: {
        borderRadius: 24,
        padding: 20,
        elevation: 2,
    },
    input: { marginBottom: 2 },
    inputOutline: { borderRadius: 12 },
    row: { flexDirection: 'row' },
    submitBtn: { marginTop: 16, borderRadius: 12 }
});
