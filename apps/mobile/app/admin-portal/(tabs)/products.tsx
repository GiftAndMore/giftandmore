import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, Surface, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, Product } from '../../../lib/mock-api';

export default function AdminProductsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await mockStore.getProducts();
        setProducts(data);
        setLoading(false);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderItem = ({ item }: { item: Product }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <TouchableOpacity onPress={() => router.push(`/admin-portal/products/${item.id}` as any)} style={{ flexDirection: 'row' }}>
                <Image source={{ uri: item.images[0] }} style={styles.image} />
                <View style={styles.details}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.category} • Stock: {item.stock}</Text>
                    <Text variant="titleSmall" style={{ marginTop: 4, color: theme.colors.primary, fontWeight: 'bold' }}>₦{item.price.toLocaleString()}</Text>
                </View>
                <IconButton icon="chevron-right" size={20} />
            </TouchableOpacity>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Catalog</Text>
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

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                label="Add Product"
                onPress={() => router.push('/admin-portal/products/new' as any)}
            />
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
