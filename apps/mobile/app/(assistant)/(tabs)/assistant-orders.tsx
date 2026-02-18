import { View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Chip, Searchbar, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { Order } from '../../../lib/mock-api/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrdersScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    const loadOrders = async () => {
        if (!refreshing) setLoading(true);
        const all = await mockStore.getOrders();
        // Sort by newest first
        const sorted = all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(sorted);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadOrders();
    }, []);

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        return o.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'processing': return '#3B82F6';
            case 'delivered': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return theme.colors.outline;
        }
    };

    const renderItem = ({ item }: { item: Order }) => (
        <Surface style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 1 }} mode="flat">
            <TouchableOpacity onPress={() => router.push(`/(assistant)/manage-orders/${item.id}`)}>
                <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <MaterialCommunityIcons name="package-variant" size={20} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Order #{item.id.slice(-4).toUpperCase()}</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <Chip textStyle={{ fontSize: 10, lineHeight: 10, color: '#fff' }} style={{ backgroundColor: getStatusColor(item.status), height: 24 }}>
                            {item.status.toUpperCase()}
                        </Chip>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}
                        </Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            ₦{item.total_amount.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Surface >
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 24, paddingTop: 60, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="arrow-left" iconColor="#fff" onPress={() => router.back()} style={{ marginLeft: -8 }} />
                        <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold' }}>Orders</Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{orders.length}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filters */}
            <View style={{ paddingHorizontal: 16, marginTop: -20, marginBottom: 8 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={['all', 'pending', 'processing', 'delivered', 'cancelled']}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <Chip
                            selected={filter === item}
                            onPress={() => setFilter(item)}
                            style={{ marginRight: 8, backgroundColor: filter === item ? theme.colors.inversePrimary : theme.colors.surface }}
                            textStyle={{ color: filter === item ? theme.colors.primary : theme.colors.onSurface }}
                            showSelectedOverlay
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Chip>
                    )}
                />
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
                        <MaterialCommunityIcons name="package-variant-closed" size={48} color={theme.colors.outline} />
                        <Text style={{ marginTop: 16 }}>No orders found</Text>
                    </View>
                }
            />
        </View>
    );
}
