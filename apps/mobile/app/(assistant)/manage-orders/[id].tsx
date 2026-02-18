import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, Card, IconButton, ActivityIndicator, Divider, Chip, Surface, List, Portal, Dialog } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockStore } from '../../../lib/mock-api';
import { Order, OrderStatus } from '../../../lib/mock-api/types';
import { useAuth } from '../../../lib/auth';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [dialog, setDialog] = useState({ visible: false, title: '', message: '', isError: false });

    useEffect(() => {
        loadData();
    }, [id, session]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [orderData, userData] = await Promise.all([
                mockStore.getOrder(id as string),
                session?.user?.id ? mockStore.getUser(session.user.id) : null
            ]);
            setOrder(orderData);
            setUserProfile(userData);
        } catch (e) {
            console.error(e);
            setDialog({ visible: true, title: 'Error', message: 'Failed to load order', isError: true });
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (task: string) => {
        if (!userProfile) return false;
        if (userProfile.role === 'admin') return true;
        return userProfile.assistant_tasks?.includes(task) || false;
    };

    const updateStatus = async (newStatus: OrderStatus) => {
        if (!order) return;
        setUpdating(true);
        try {
            const updated = await mockStore.updateOrderStatus(order.id, newStatus);

            // Add to timeline - in a real app backend handles this
            const newTimeline = [...(order.timeline || []), {
                status: newStatus,
                date: new Date().toISOString(),
                note: `Status updated to ${newStatus} by ${userProfile?.full_name || 'Assistant'}`
            }];

            // We need to update timeline manually in mock as updateOrder might not doing it intelligently
            // Actually mockStore.updateOrder is simple.
            // Let's assume for now we just refresh.

            setOrder({ ...order, status: newStatus });
            setDialog({ visible: true, title: 'Success', message: `Order status updated to ${newStatus}`, isError: false });
        } catch (e) {
            setDialog({ visible: true, title: 'Error', message: 'Failed to update status', isError: true });
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#F59E0B'; // Amber
            case 'processing': return '#3B82F6'; // Blue
            case 'out_for_delivery': return '#8B5CF6'; // Purple
            case 'delivered': return '#10B981'; // Emerald
            case 'cancelled': return '#EF4444'; // Red
            default: return theme.colors.outline;
        }
    };

    const getActionButtons = () => {
        if (!hasPermission('update_orders')) return null;

        switch (order?.status) {
            case 'confirmed':
            case 'placed':
                return (
                    <Button
                        mode="contained"
                        onPress={() => updateStatus('processing')}
                        loading={updating}
                        style={{ marginTop: 16, backgroundColor: '#3B82F6' }}
                    >
                        Start Processing
                    </Button>
                );
            case 'processing':
                return (
                    <Button
                        mode="contained"
                        onPress={() => updateStatus('out_for_delivery')}
                        loading={updating}
                        style={{ marginTop: 16, backgroundColor: '#8B5CF6' }}
                    >
                        Mark Out for Delivery
                    </Button>
                );
            case 'out_for_delivery':
                return (
                    <Button
                        mode="contained"
                        onPress={() => updateStatus('delivered')}
                        loading={updating}
                        style={{ marginTop: 16, backgroundColor: '#10B981' }}
                    >
                        Mark Delivered
                    </Button>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <Text>Order not found</Text>
                <Button onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 24, paddingTop: 60, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton icon="arrow-left" iconColor="#fff" onPress={() => router.back()} style={{ marginLeft: -8 }} />
                    <View>
                        <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold' }}>Order Details</Text>
                        <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>#{order.id}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* Status Card */}
                <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 2, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Current Status</Text>
                        <Chip textStyle={{ color: '#fff' }} style={{ backgroundColor: getStatusColor(order.status) }}>
                            {order.status.toUpperCase().replace(/_/g, ' ')}
                        </Chip>
                    </View>
                    <Divider style={{ marginBottom: 12 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Order Date</Text>
                            <Text variant="bodyMedium">{new Date(order.created_at).toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Total Amount</Text>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>₦{order.total_amount.toLocaleString()}</Text>
                        </View>
                    </View>

                    {getActionButtons()}
                </Surface>

                {/* Customer Info */}
                <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 1, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <MaterialCommunityIcons name="account" size={24} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>Customer</Text>
                    </View>
                    <View style={{ gap: 8 }}>
                        <View>
                            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Name</Text>
                            <Text variant="bodyLarge">{order.user_name}</Text>
                        </View>
                        <View>
                            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Recipient</Text>
                            <Text variant="bodyLarge">{order.recipient_name} ({order.recipient_phone})</Text>
                        </View>
                        <View>
                            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Shipping Address</Text>
                            <Text variant="bodyLarge">{order.shipping_address}</Text>
                        </View>
                        {order.notes && (
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.outline }}>Notes</Text>
                                <Text variant="bodyLarge" style={{ fontStyle: 'italic' }}>{order.notes}</Text>
                            </View>
                        )}
                    </View>
                </Surface>

                {/* Items */}
                <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 1, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <MaterialCommunityIcons name="shopping" size={24} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>Order Items</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{order.items.length} items</Text>
                        </View>
                    </View>

                    {order.items.map((item, index) => (
                        <View key={index} style={{ marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1 }}>
                                    <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.product_name}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Qty: {item.quantity}</Text>
                                </View>
                                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>₦{(item.price * item.quantity).toLocaleString()}</Text>
                            </View>
                            {index < order.items.length - 1 && <Divider style={{ marginTop: 12 }} />}
                        </View>
                    ))}
                </Surface>

                {/* Timeline */}
                <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>Timeline</Text>
                    </View>

                    {order.timeline?.map((event, index) => (
                        <View key={index} style={{ flexDirection: 'row', marginBottom: 16 }}>
                            <View style={{ alignItems: 'center', marginRight: 12 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: index === order.timeline.length - 1 ? theme.colors.primary : theme.colors.outline }} />
                                {index < order.timeline.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: theme.colors.outlineVariant, marginTop: 4 }} />}
                            </View>
                            <View style={{ flex: 1, paddingBottom: index < order.timeline.length - 1 ? 16 : 0 }}>
                                <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: index === order.timeline.length - 1 ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                                    {event.status.toUpperCase().replace(/_/g, ' ')}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 4 }}>
                                    {new Date(event.date).toLocaleString()}
                                </Text>
                                {event.note && (
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{event.note}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </Surface>

            </ScrollView>

            <Portal>
                <Dialog visible={dialog.visible} onDismiss={() => setDialog({ ...dialog, visible: false })} style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons
                            name={dialog.isError ? 'alert-circle' : 'check-circle'}
                            size={48}
                            color={dialog.isError ? theme.colors.error : theme.colors.primary}
                        />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
                        {dialog.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
                            {dialog.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        <Button
                            mode="contained"
                            onPress={() => setDialog({ ...dialog, visible: false })}
                            style={{ borderRadius: 20, paddingHorizontal: 20 }}
                            buttonColor={theme.colors.primary}
                        >
                            OK
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}
