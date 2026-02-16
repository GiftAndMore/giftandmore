import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Surface, ActivityIndicator, useTheme, Chip, List, Divider, Menu } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockStore, Order, OrderStatus } from '../../../lib/mock-api';

export default function AdminOrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusMenuVisible, setStatusMenuVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (typeof id === 'string') {
            const data = await mockStore.getOrder(id);
            setOrder(data || null);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (status: OrderStatus) => {
        if (!order) return;
        setUpdating(true);
        setStatusMenuVisible(false);
        try {
            const updated = await mockStore.updateOrderStatus(order.id, status, 'Admin update');
            setOrder(updated || null);
            Alert.alert('Success', `Order status updated to ${status}`);
        } catch (e) {
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;
    if (!order) return <Text style={{ padding: 20 }}>Order not found</Text>;

    const steps = [
        { label: 'Placed', value: 'placed' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' }
    ];

    const currentStepIndex = steps.findIndex(s => s.value === order.status);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Button icon="arrow-left" mode="text" onPress={() => router.back()}>Back</Button>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Order #{order.id.split('-')[1]}</Text>
            </View>

            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Current Status</Text>
                    <Menu
                        visible={statusMenuVisible}
                        onDismiss={() => setStatusMenuVisible(false)}
                        anchor={<Chip onPress={() => setStatusMenuVisible(true)} icon="pencil">{order.status.toUpperCase()}</Chip>}
                    >
                        {steps.map(s => (
                            <Menu.Item key={s.value} onPress={() => handleStatusUpdate(s.value as any)} title={s.label} />
                        ))}
                    </Menu>
                </View>
                {/* Simple Stepper */}
                <View style={styles.stepper}>
                    {steps.map((step, index) => (
                        <View key={step.value} style={{ alignItems: 'center', flex: 1 }}>
                            <View style={[styles.stepDot, { backgroundColor: index <= currentStepIndex ? theme.colors.primary : '#E5E7EB' }]} />
                            <Text style={{ fontSize: 10, textAlign: 'center', marginTop: 4 }}>{step.label}</Text>
                        </View>
                    ))}
                </View>
            </Surface>

            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 10 }}>Order Items</Text>
                {order.items.map((item, idx) => (
                    <List.Item
                        key={idx}
                        title={item.product_name}
                        description={`Quantity: ${item.quantity} • ₦${item.price.toLocaleString()}`}
                        left={props => <List.Icon {...props} icon="package-variant" />}
                    />
                ))}
                <Divider style={{ marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="titleMedium">Total Amount</Text>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>₦{order.total_amount.toLocaleString()}</Text>
                </View>
            </Surface>

            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 10 }}>Customer Details</Text>
                <List.Item title="Customer" description={order.user_name} left={props => <List.Icon {...props} icon="account" />} />
                <List.Item title="Recipient" description={`${order.recipient_name} (${order.recipient_phone})`} left={props => <List.Icon {...props} icon="gift-outline" />} />
                <List.Item title="Shipping Address" description={order.shipping_address} left={props => <List.Icon {...props} icon="map-marker" />} />
            </Surface>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, paddingTop: 40, flexDirection: 'row', alignItems: 'center', gap: 10 },
    section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
    stepper: { flexDirection: 'row', justifyContent: 'space-between' },
    stepDot: { width: 12, height: 12, borderRadius: 6 },
});
