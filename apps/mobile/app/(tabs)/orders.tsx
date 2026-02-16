import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, Chip, Divider, Appbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrderList() {
    const router = useRouter();
    const theme = useTheme();
    const [orders, setOrders] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setRefreshing(true);
        setTimeout(() => {
            const mockOrders = [
                { id: '12345678-001', status: 'delivered', created_at: new Date().toISOString(), total_amount: 145000 },
                { id: '87654321-002', status: 'processing', created_at: new Date().toISOString(), total_amount: 52000 },
            ];
            setOrders(mockOrders);
            setRefreshing(false);
        }, 1200);
    };

    const getStatusColor = (status: string) => {
        const isDark = theme.dark;
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: isDark ? '#064e3b' : '#DEF7EC', text: isDark ? '#34d399' : '#03543F' };
            case 'pending': return { bg: isDark ? '#7f1d1d' : '#FDF2F2', text: isDark ? '#f87171' : '#9B1C1C' };
            case 'processing': return { bg: isDark ? '#1e3a8a' : '#E1EFFE', text: isDark ? '#60a5fa' : '#1E429F' };
            case 'shipped': return { bg: isDark ? '#78350f' : '#FEF3C7', text: isDark ? '#fbbf24' : '#92400E' };
            default: return { bg: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const statusStyle = getStatusColor(item.status);
        const date = new Date(item.created_at).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/orders/${item.id}`)}
                style={styles.cardWrapper}
            >
                <Surface style={[styles.orderCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <View style={styles.orderHeader}>
                        <View>
                            <Text variant="titleMedium" style={[styles.orderId, { color: theme.colors.onSurface }]}>Order #{item.id.slice(0, 8)}</Text>
                            <Text variant="bodySmall" style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>{date}</Text>
                        </View>
                        <Chip
                            style={{ backgroundColor: statusStyle.bg }}
                            textStyle={{ color: statusStyle.text, fontSize: 10, fontWeight: 'bold' }}
                        >
                            {item.status.toUpperCase()}
                        </Chip>
                    </View>

                    <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                    <View style={styles.orderFooter}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Total Amount</Text>
                        <Text variant="titleMedium" style={[styles.priceText, { color: theme.colors.primary }]}>₦{Number(item.total_amount).toLocaleString()}</Text>
                    </View>
                </Surface>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.headerTitle}>Order Details</Text>
            </View>

            {orders.length === 0 && !refreshing ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="package-variant" size={80} color={theme.colors.surfaceVariant} />
                    <Text variant="headlineSmall" style={[styles.emptyText, { color: theme.colors.onSurface }]}>No orders yet</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                        When you place an order, it will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} colors={[theme.colors.primary]} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        elevation: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 24 },
    listContent: { padding: 16 },
    cardWrapper: { marginBottom: 16 },
    orderCard: {
        borderRadius: 16,
        padding: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    orderId: { fontWeight: 'bold' },
    orderDate: {},
    divider: { marginVertical: 12 },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    priceText: { fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 }
});
