import { View, FlatList, Image } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, IconButton, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { Product } from '../../../lib/mock-api/types';
import { useAuth } from '../../../lib/auth';

export default function ProductsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [hasAddPermission, setHasAddPermission] = useState(false);
    const [hasManagePermission, setHasManagePermission] = useState(false);

    useEffect(() => {
        checkPermissions();
        loadProducts();
    }, [session]); // Re-run when session matches

    const checkPermissions = async () => {
        if (session?.user?.id) {
            try {
                // Always fetch fresh user data to ensure permissions are up to date
                const user = await mockStore.getUser(session.user.id);
                if (user?.role === 'admin') {
                    setHasAddPermission(true);
                    setHasManagePermission(true);
                } else if (user?.role === 'assistant') {
                    setHasAddPermission(user.assistant_tasks?.includes('add_products') || false);
                    setHasManagePermission(user.assistant_tasks?.includes('manage_products') || false);
                }
            } catch (e) {
                console.error("Failed to check permissions", e);
            }
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        const all = await mockStore.getProducts();
        setProducts(all);
        setLoading(false);
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderItem = ({ item }: { item: Product }) => (
        <Card style={{ marginBottom: 12, marginHorizontal: 16 }} onPress={() => {
            if (hasManagePermission) {
                router.push(`/(assistant)/manage-products/${item.id}`);
            }
        }}>
            <Card.Content style={{ flexDirection: 'row', gap: 16 }}>
                <Image source={{ uri: item.images[0] }} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' }} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <View>
                        {item.sales_price && item.sales_price > 0 &&
                            (!item.sales_start_date || new Date(item.sales_start_date) <= new Date()) &&
                            (!item.sales_end_date || new Date(item.sales_end_date) >= new Date()) ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    ₦{item.sales_price.toLocaleString()}
                                </Text>
                                <Text variant="bodyMedium" style={{ textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant }}>
                                    ₦{item.price.toLocaleString()}
                                </Text>
                                <View style={{ borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 0 }}>
                                    <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: 'bold' }}>
                                        -{Math.round(((item.price - item.sales_price) / item.price) * 100)}%
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text variant="bodyMedium">₦{item.price.toLocaleString()}</Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {item.category && (
                            <Chip textStyle={{ fontSize: 10, lineHeight: 14 }} style={{ height: 24 }}>{item.category.join(', ')}</Chip>
                        )}
                        <Chip textStyle={{ fontSize: 10, lineHeight: 14 }} style={{ height: 24 }}>Stock: {item.stock}</Chip>
                    </View>
                </View>
                {hasManagePermission && <IconButton icon="pencil" size={20} />}
            </Card.Content>
        </Card>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ padding: 16, paddingBottom: 8 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Products</Text>
                <Searchbar
                    placeholder="Search products..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ marginTop: 12, backgroundColor: theme.colors.surface }}
                />
            </View>
            <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
                refreshing={loading}
                onRefresh={loadProducts}
            />
            {hasAddPermission && (
                <FAB
                    icon="plus"
                    label="New Product"
                    style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
                    onPress={() => router.push('/(assistant)/manage-products/new')}
                />
            )}
        </View>
    );
}
