import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Chip, Surface, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, Order } from '../../../lib/mock-api';

export default function AdminOrdersScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const data = await mockStore.getOrders();
        // Sort by date desc
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        let result = orders;
        if (searchQuery) {
            const low = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(low) ||
                o.user_name.toLowerCase().includes(low) ||
                o.recipient_name.toLowerCase().includes(low)
            );
        }
        if (statusFilter) {
            result = result.filter(o => o.status === statusFilter);
        }
        setFilteredOrders(result);
    }, [searchQuery, statusFilter, orders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed': return '#3B82F6'; // Blue
            case 'confirmed': return '#8B5CF6'; // Purple
            case 'processing': return '#F59E0B'; // Orange
            case 'delivered': return '#10B981'; // Green
            case 'cancelled': return '#EF4444'; // Red
            default: return '#808080'; // Gray
        }
    };

    const renderItem = ({ item }: { item: Order }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <TouchableOpacity onPress={() => router.push(`/admin-portal/orders/${item.id}` as any)}>
                <View style={styles.cardHeader}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>#{item.id.split('-')[1]}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) + '20' }} textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}>
                        {item.status.toUpperCase()}
                    </Chip>
                </View>
                <Text style={{ marginTop: 4, color: theme.colors.onSurface }}>To: {item.recipient_name}</Text>
                <Text style={{ marginTop: 2, color: theme.colors.onSurfaceVariant }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <View style={styles.cardFooter}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>₦{item.total_amount.toLocaleString()}</Text>
                    <Text variant="bodySmall">{item.items.length} items</Text>
                </View>
            </TouchableOpacity>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Orders</Text>
                <Searchbar
                    placeholder="Search ID, Name..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <Chip selected={statusFilter === null} onPress={() => setStatusFilter(null)}>All</Chip>
                    <Chip selected={statusFilter === 'placed'} onPress={() => setStatusFilter('placed')}>Placed</Chip>
                    <Chip selected={statusFilter === 'processing'} onPress={() => setStatusFilter('processing')}>Processing</Chip>
                    <Chip selected={statusFilter === 'delivered'} onPress={() => setStatusFilter('delivered')}>Delivered</Chip>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No orders found.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 10 },
    card: { marginBottom: 16, padding: 16, borderRadius: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }
});
