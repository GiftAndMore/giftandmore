import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, useTheme, TextInput, IconButton, ActivityIndicator, Divider, Chip, Surface, Portal, Dialog } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockStore } from '../../../lib/mock-api';
import { CustomRequest } from '../../../lib/mock-api/types';
import { useAuth } from '../../../lib/auth';

export default function RequestDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();

    const [request, setRequest] = useState<CustomRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteMessage, setQuoteMessage] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [dialog, setDialog] = useState({ visible: false, title: '', message: '', isError: false });

    useEffect(() => {
        loadData();
    }, [id, session]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [requestData, userData] = await Promise.all([
                mockStore.getRequests().then(reqs => reqs.find(r => r.id === id)),
                session?.user?.id ? mockStore.getUser(session.user.id) : null
            ]);
            setRequest(requestData || null);
            setUserProfile(userData);
            if (requestData?.quote_amount) setQuoteAmount(requestData.quote_amount.toString());
            if (requestData?.quote_message) setQuoteMessage(requestData.quote_message);
        } catch (e) {
            console.error(e);
            setDialog({ visible: true, title: 'Error', message: 'Failed to load request', isError: true });
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (task: string) => {
        if (!userProfile) return false;
        if (userProfile.role === 'admin') return true;
        return userProfile.assistant_tasks?.includes(task) || false;
    };

    const handleUpdateStatus = async (status: CustomRequest['status']) => {
        if (!request) return;
        setUpdating(true);
        try {
            const quote = status === 'quoted' ? {
                amount: parseInt(quoteAmount),
                message: quoteMessage
            } : undefined;

            await mockStore.updateRequestStatus(request.id, status, quote);

            // Refresh local state manually since mockStore doesn't return updated object for requests
            setRequest(prev => prev ? ({ ...prev, status, quote_amount: quote?.amount, quote_message: quote?.message }) : null);

            setDialog({ visible: true, title: 'Success', message: `Request status updated to ${status}`, isError: false });
            if (status === 'quoted') router.back();
        } catch (e) {
            setDialog({ visible: true, title: 'Error', message: 'Failed to update status', isError: true });
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return '#EC4899';
            case 'quoted': return '#8B5CF6';
            case 'accepted': return '#10B981';
            case 'rejected': return '#EF4444';
            case 'paid': return '#059669';
            case 'resolved': return '#10B981';
            default: return theme.colors.outline;
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!request) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <Text>Request not found</Text>
                <Button onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    const canManage = hasPermission('manage_custom_requests');

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 24, paddingTop: 60, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="arrow-left" iconColor="#fff" onPress={() => router.back()} style={{ marginLeft: -8 }} />
                        <View style={{ flex: 1 }}>
                            <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold' }} numberOfLines={1}>{request.title || 'Request Details'}</Text>
                            <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>#{request.id}</Text>
                        </View>
                        <Chip textStyle={{ color: '#fff', fontSize: 12 }} style={{ backgroundColor: getStatusColor(request.status) }}>
                            {request.status.toUpperCase()}
                        </Chip>
                    </View>
                </LinearGradient>

                <View style={{ padding: 16 }}>
                    {/* Request Details */}
                    <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 1, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>Details</Text>
                        </View>

                        <View style={{ gap: 12 }}>
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Customer</Text>
                                <Text variant="bodyLarge">{request.user_name}</Text>
                            </View>
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Purpose</Text>
                                <Text variant="bodyLarge">{request.purpose}</Text>
                            </View>
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Recipient</Text>
                                <Text variant="bodyLarge">{request.recipient_details}</Text>
                            </View>
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Budget</Text>
                                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>₦{parseInt(request.budget).toLocaleString()}</Text>
                            </View>
                            <Divider />
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Description</Text>
                                <Text variant="bodyLarge">{request.description}</Text>
                            </View>
                        </View>
                    </Surface>

                    {/* Actions */}
                    {canManage && (request.status === 'new' || request.status === 'in_review') && (
                        <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <MaterialCommunityIcons name="gavel" size={24} color={theme.colors.primary} />
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>Respond</Text>
                            </View>

                            <TextInput
                                label="Quote Amount (₦)"
                                value={quoteAmount}
                                onChangeText={setQuoteAmount}
                                mode="outlined"
                                keyboardType="numeric"
                                style={{ marginBottom: 12 }}
                            />
                            <TextInput
                                label="Message to Customer"
                                value={quoteMessage}
                                onChangeText={setQuoteMessage}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={{ marginBottom: 16 }}
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Button
                                    mode="outlined"
                                    onPress={() => handleUpdateStatus('rejected')}
                                    textColor={theme.colors.error}
                                    style={{ flex: 1, borderColor: theme.colors.error }}
                                    loading={updating}
                                >
                                    Reject
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => handleUpdateStatus('quoted')}
                                    style={{ flex: 1 }}
                                    loading={updating}
                                    disabled={!quoteAmount || !quoteMessage}
                                >
                                    Send Quote
                                </Button>
                            </View>
                        </Surface>
                    )}

                    {/* Quoted Status View */}
                    {request.status === 'quoted' && (
                        <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.secondaryContainer, elevation: 0 }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Quote Sent</Text>
                            <Text variant="bodyLarge" style={{ marginTop: 8 }}>Amount: ₦{request.quote_amount?.toLocaleString()}</Text>
                            <Text variant="bodyMedium" style={{ marginTop: 4, fontStyle: 'italic' }}>"{request.quote_message}"</Text>
                        </Surface>
                    )}
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={dialog.visible} onDismiss={() => setDialog({ ...dialog, visible: false })} style={{ backgroundColor: theme.dark ? '#1E293B' : theme.colors.surface }}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons
                            name={dialog.isError ? 'alert-circle' : 'check-circle'}
                            size={48}
                            color={dialog.isError ? theme.colors.error : '#10B981'}
                        />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', color: dialog.isError ? theme.colors.error : '#10B981' }}>
                        {dialog.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            {dialog.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        <Button onPress={() => setDialog({ ...dialog, visible: false })} contentStyle={{ paddingHorizontal: 24 }}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </KeyboardAvoidingView >
    );
}
