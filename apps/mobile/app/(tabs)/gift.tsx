import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, FlatList, Image } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Badge, Menu, Divider, useTheme, Searchbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ALL_PRODUCTS } from '../../lib/data';
import { useCart } from '../../lib/CartContext';

const { width } = Dimensions.get('window');

const purposes = ["All", "Wedding", "Birthday", "Valentine", "Anniversary", "Celebration", "Baby", "Thank You", "Baby Shower"];
const genders = ["All", "Male", "Female", "Unisex"];

const allProducts = ALL_PRODUCTS;

export default function GiftScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const theme = useTheme();

    // Filters
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedGender, setSelectedGender] = useState("All");
    const [priceOrder, setPriceOrder] = useState<"asc" | "desc" | null>(null);
    const [priceMenuVisible, setPriceMenuVisible] = useState(false);
    const [genderMenuVisible, setGenderMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { cartCount, addToCart: contextAddToCart } = useCart();

    useEffect(() => {
        if (params.category && typeof params.category === 'string') {
            setSelectedCategory(params.category);
        }
        if (params.q && typeof params.q === 'string') {
            setSearchQuery(params.q);
        }
    }, [params.category, params.q]);

    // Filtering Logic
    const filteredProducts = allProducts
        .filter(p => {
            const matchCategory = selectedCategory === "All" || p.category === selectedCategory || (selectedCategory === "Wedding" && p.category === "Anniversary");
            const matchGender = selectedGender === "All" || p.gender === selectedGender;

            // Search Query Match
            const searchLower = searchQuery.toLowerCase().trim();
            const matchSearch = !searchLower ||
                p.title.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower);

            return matchCategory && matchGender && matchSearch;
        })
        .sort((a, b) => {
            if (!priceOrder) return 0;
            return priceOrder === 'asc' ? a.price - b.price : b.price - a.price;
        });

    const addToCart = (product: any) => {
        contextAddToCart({
            productId: product.id,
            name: product.title,
            price: product.price,
            quantity: 1,
            image: product.media?.[0]?.url,
            color: product.colors?.[0], // Default
            size: product.sizes?.[0]   // Default
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.headerTitle}>Shop Gifts</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Menu
                        visible={priceMenuVisible}
                        onDismiss={() => setPriceMenuVisible(false)}
                        anchor={
                            <IconButton
                                icon={priceOrder === 'asc' ? "sort-ascending" : priceOrder === 'desc' ? "sort-descending" : "sort"}
                                iconColor="white"
                                size={24}
                                onPress={() => setPriceMenuVisible(true)}
                            />
                        }
                    >
                        <Menu.Item onPress={() => { setPriceOrder('asc'); setPriceMenuVisible(false); }} title="Price: Low to High" />
                        <Menu.Item onPress={() => { setPriceOrder('desc'); setPriceMenuVisible(false); }} title="Price: High to Low" />
                        <Divider />
                        <Menu.Item onPress={() => { setPriceOrder(null); setPriceMenuVisible(false); }} title="Reset Sort" />
                    </Menu>

                    <View>
                        <IconButton
                            icon="cart-outline"
                            iconColor="white"
                            size={28}
                            onPress={() => router.push("/checkout")}
                        />
                        {cartCount > 0 && (
                            <Badge style={styles.badge}>{cartCount}</Badge>
                        )}
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                <Searchbar
                    placeholder="Search gifts..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ borderRadius: 12, backgroundColor: theme.colors.surface, height: 45 }}
                    inputStyle={{ minHeight: 0 }}
                    elevation={1}
                />
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {purposes.map((p) => (
                        <Chip
                            key={p}
                            style={[
                                styles.chip,
                                { backgroundColor: selectedCategory === p ? theme.colors.primary : theme.colors.surface },
                                selectedCategory === p && styles.selectedChip
                            ]}
                            textStyle={{ color: selectedCategory === p ? 'white' : theme.colors.onSurface }}
                            onPress={() => setSelectedCategory(p)}
                        >
                            {p}
                        </Chip>
                    ))}
                </ScrollView>

                <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: theme.colors.onSurfaceVariant, marginRight: 8 }}>Filter:</Text>
                    <Menu
                        visible={genderMenuVisible}
                        onDismiss={() => setGenderMenuVisible(false)}
                        anchor={
                            <Chip
                                icon="chevron-down"
                                onPress={() => setGenderMenuVisible(true)}
                                style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }}
                                textStyle={{ color: theme.colors.onSurface }}
                            >
                                {selectedGender}
                            </Chip>
                        }
                    >
                        {genders.map(g => (
                            <Menu.Item
                                key={g}
                                onPress={() => { setSelectedGender(g); setGenderMenuVisible(false); }}
                                title={g}
                            />
                        ))}
                    </Menu>
                </View>
            </View>

            {/* Result count / Clear filters */}
            {(searchQuery.trim() !== "" || selectedCategory !== "All" || selectedGender !== "All") && (
                <View style={{ paddingHorizontal: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                    </Text>
                    <Button compact mode="text" onPress={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedGender("All"); }}>
                        Clear
                    </Button>
                </View>
            )}

            {/* Product Grid */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <IconButton icon="magnify-close" size={48} iconColor={theme.colors.onSurfaceVariant} />
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                            {searchQuery ? `No results found for "${searchQuery}"` : "No gifts found in this category"}
                        </Text>
                        <Button mode="text" onPress={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedGender("All"); }}>
                            Clear all filters
                        </Button>
                    </View>
                }
                renderItem={({ item }) => (
                    <Card
                        style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
                        mode="elevated"
                        onPress={() => router.push({ pathname: "/product-details", params: { id: item.id } })}
                    >
                        {item.media && item.media[0] && item.media[0].url ? (
                            <Image
                                source={{ uri: item.media[0].url }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>No Image</Text>
                            </View>
                        )}
                        <Card.Content style={styles.cardContent}>
                            <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{item.title}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.category}</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.gender}</Text>
                            </View>
                            <Text variant="titleMedium" style={{ color: theme.colors.primary, marginTop: 4, fontWeight: '700' }}>
                                ₦{item.price.toLocaleString()}
                            </Text>
                        </Card.Content>
                        <Card.Actions style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
                            <Button
                                mode="contained"
                                style={{ flex: 1, borderRadius: 8 }}
                                labelStyle={{ fontSize: 12, marginVertical: 6 }}
                                onPress={(e) => {
                                    e.preventDefault();
                                    addToCart(item);
                                }}
                            >
                                Add to Cart
                            </Button>
                        </Card.Actions>
                    </Card>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#F59E0B' },

    filterContainer: { paddingVertical: 12 },
    filterContent: { paddingHorizontal: 16, gap: 8 },
    chip: { borderWidth: 1, borderColor: 'transparent' },
    selectedChip: { borderWidth: 0 },

    grid: { padding: 12, paddingBottom: 80 },
    productCard: {
        flex: 1,
        margin: 6,
        borderRadius: 12,
        overflow: 'hidden'
    },
    imagePlaceholder: { width: '100%', height: 120, justifyContent: 'center', alignItems: 'center' },
    productImage: { width: '100%', height: 120 },
    cardContent: { padding: 8 },
});
