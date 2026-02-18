import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, Surface, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, Product } from '../../../lib/mock-api';

import { useAdminAuth } from '../../../lib/admin-auth';

export default function AdminProductsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { adminSession } = useAdminAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        loadData();
    }, [adminSession]);

    const loadData = async () => {
        setLoading(true);
        const prods = await mockStore.getProducts();
        setProducts(prods);

        // Admin Portal is currently only for Super Admin, who has all permissions
        if (adminSession) {
            setHasPermission(true);
        }

        setLoading(false);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderItem = ({ item }: { item: Product }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <TouchableOpacity onPress={() => router.push(`/admin-portal/products/${item.id}` as any)} style={{ flexDirection: 'row' }}>
                <Image source={{ uri: item.images[0] }} style={styles.image} />
                <View style={styles.details}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {Array.isArray(item.category) ? item.category.join(', ') : item.category} • Stock: {item.stock}
                    </Text>
                    <View style={{ marginTop: 4 }}>
                        {item.sales_price && item.sales_price > 0 &&
                            (!item.sales_start_date || new Date(item.sales_start_date) <= new Date()) &&
                            (!item.sales_end_date || new Date(item.sales_end_date) >= new Date()) ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    ₦{item.sales_price.toLocaleString()}
                                </Text>
                                <Text variant="bodySmall" style={{ textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant }}>
                                    ₦{item.price.toLocaleString()}
                                </Text>
                                <View style={{ borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 0 }}>
                                    <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: 'bold' }}>
                                        -{Math.round(((item.price - item.sales_price) / item.price) * 100)}%
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                ₦{item.price.toLocaleString()}
                            </Text>
                        )}
                    </View>
                </View>
                <IconButton icon="chevron-right" size={20} />
            </TouchableOpacity>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Products</Text>
                <Searchbar
                    placeholder="Search products..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ backgroundColor: theme.colors.surface }}
                />
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                />
            )}

            {hasPermission && (
                <FAB
                    icon="plus"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    color="white"
                    label="Add Product"
                    onPress={() => router.push('/admin-portal/products/new' as any)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 10 },
    card: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
    image: { width: 80, height: 80 },
    details: { flex: 1, padding: 10, justifyContent: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
