import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Image, FlatList } from "react-native";
import { Text, Card, Button, Chip, IconButton, Searchbar, FAB, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../lib/auth";

import { ALL_PRODUCTS } from "../../lib/data";

const { width } = Dimensions.get('window');

const purposes = ["Wedding", "Birthday", "Valentine", "Anniversary", "Celebration", "Thank You", "Baby Shower"];

const banners = [
    { id: '1', title: "Valentine's Special", subtitle: "Curated romantic sets", color: ['#FF4B6E', '#FF8E9E'] },
    { id: '2', title: "Wedding Packages", subtitle: "Elegant gifts for the couple", color: ['#6D28D9', '#9333EA'] },
    { id: '3', title: "Birthday Bash", subtitle: "Fun gifts for everyone", color: ['#F59E0B', '#FCD34D'] }
];

const featured = [
    { id: '1', title: "Luxury Flower Box", price: "₦35,000", image: "https://via.placeholder.com/150" },
    { id: '2', title: "Office Set", price: "₦18,500", image: "https://via.placeholder.com/150" },
    { id: '3', title: "Chocolate Hamper", price: "₦25,000", image: "https://via.placeholder.com/150" },
    { id: '4', title: "Watch & Wallet", price: "₦45,000", image: "https://via.placeholder.com/150" },
    { id: '5', title: "Spa Day Kit", price: "₦30,000", image: "https://via.placeholder.com/150" },
    { id: '6', title: "Gourmet Wine Box", price: "₦55,000", image: "https://via.placeholder.com/150" },
];

export default function HomeScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const liveResults = searchQuery.trim()
        ? ALL_PRODUCTS.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10) // Limit to 10 for performance in home view
        : [];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const nextIndex = (prevIndex + 1) % banners.length;
                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                return nextIndex;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Auth guard: redirect unauthenticated users to login
    if (!session) {
        return <Redirect href="/auth/login" />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header Section with Search */}
            <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Hello, User</Text>
                        <Text style={styles.subGreeting}>Find the perfect gift</Text>
                    </View>
                    <IconButton icon="bell-outline" iconColor="white" onPress={() => router.push("/notifications")} />
                </View>
                <Searchbar
                    placeholder="Search for gifts..."
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    iconColor="black"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{ minHeight: 0, color: 'black' }}
                    onSubmitEditing={() => {
                        if (searchQuery.trim()) {
                            router.push({ pathname: "/(tabs)/gift", params: { q: searchQuery.trim() } });
                        }
                    }}
                    onIconPress={() => {
                        if (searchQuery.trim()) {
                            router.push({ pathname: "/(tabs)/gift", params: { q: searchQuery.trim() } });
                        }
                    }}
                />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                {searchQuery.trim() ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Search Results</Text>
                        <View style={styles.grid}>
                            {liveResults.length > 0 ? (
                                liveResults.map(item => (
                                    <Card
                                        key={item.id}
                                        style={[styles.gridCard, { backgroundColor: theme.colors.surface }]}
                                        onPress={() => router.push({ pathname: "/product-details", params: { id: item.id } })}
                                        mode="elevated"
                                    >
                                        <View style={[styles.gridImagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                            {item.media?.[0]?.url ? (
                                                <Image source={{ uri: item.media[0].url }} style={{ width: '100%', height: '100%' }} />
                                            ) : null}
                                        </View>
                                        <Card.Content style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
                                            <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '700', color: theme.colors.onSurface }}>{item.title}</Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 4 }}>₦{item.price.toLocaleString()}</Text>
                                        </Card.Content>
                                    </Card>
                                ))
                            ) : (
                                <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
                                    <Text style={{ color: theme.colors.onSurfaceVariant }}>No results found for "{searchQuery}"</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Slide Banners */}
                        <View style={styles.section}>
                            <FlatList
                                ref={flatListRef}
                                data={banners}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.bannerScroll}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <LinearGradient
                                        colors={item.color as [string, string, ...string[]]}
                                        style={styles.bannerCard}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.bannerContent}>
                                            <Text style={styles.bannerTitle}>{item.title}</Text>
                                            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                                            <Button
                                                mode="contained"
                                                buttonColor="white"
                                                textColor={item.color[0]}
                                                style={styles.bannerBtn}
                                                onPress={() => router.push({ pathname: '/package-details', params: { id: item.id, title: item.title } })}
                                            >
                                                Order Now
                                            </Button>
                                        </View>
                                    </LinearGradient>
                                )}
                                getItemLayout={(data, index) => ({
                                    length: width * 0.75,
                                    offset: (width * 0.75 + 12) * index, // Width + gap
                                    index
                                })}
                                onScrollToIndexFailed={(info) => {
                                    // Fallback if scroll fails (e.g. data not ready)
                                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                                    wait.then(() => {
                                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                                    });
                                }}
                            />
                        </View>

                        {/* Shop by Purpose */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Shop by Purpose</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                                {purposes.map((p) => (
                                    <Chip
                                        key={p}
                                        style={[styles.chip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
                                        textStyle={{ fontWeight: '600', color: theme.colors.onSurface }}
                                        onPress={() => router.push({ pathname: "/(tabs)/gift", params: { category: p } })}
                                    >
                                        {p}
                                    </Chip>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Custom Request CTA */}
                        <View style={styles.section}>
                            <Card
                                style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}
                                mode="elevated"
                                onPress={() => router.push("/custom-request")}
                            >
                                <Card.Content style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="titleMedium" style={{ fontWeight: '700', color: 'white' }}>Don't know what to order?</Text>
                                        <Text variant="bodyMedium" style={{ color: 'white', opacity: 0.9, marginTop: 4 }}>Create a custom request & get quotes.</Text>
                                    </View>
                                    <MaterialCommunityIcons name="star-face" size={40} color="white" />
                                </Card.Content>
                            </Card>
                        </View>

                        {/* Featured Gifts (Grid) */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Featured Gifts</Text>
                            <View style={styles.grid}>
                                {featured.map(item => (
                                    <Card
                                        key={item.id}
                                        style={[styles.gridCard, { backgroundColor: theme.colors.surface }]}
                                        onPress={() => router.push({ pathname: "/product-details", params: { id: item.id } })}
                                        mode="elevated"
                                    >
                                        <View style={[styles.gridImagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                            <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                                        </View>
                                        <Card.Content style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
                                            <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '700', color: theme.colors.onSurface }}>{item.title}</Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 4 }}>{item.price}</Text>
                                        </Card.Content>
                                    </Card>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            <FAB
                icon="chat-processing"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={() => router.push("/chat")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    headerContainer: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    greeting: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subGreeting: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
    searchBar: { borderRadius: 12, backgroundColor: 'white', height: 45 },

    section: { marginTop: 24 },
    sectionTitle: { paddingHorizontal: 16, fontSize: 18, fontWeight: '700', marginBottom: 12 },

    heroCard: { marginHorizontal: 16, borderRadius: 18 },

    bannerScroll: { paddingHorizontal: 16, gap: 12 },
    bannerCard: { width: width * 0.75, height: 140, borderRadius: 16, padding: 16, justifyContent: 'center' },
    bannerContent: { alignItems: 'flex-start' },
    bannerTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 4 },
    bannerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 12 },
    bannerBtn: { borderRadius: 8 },

    chipRow: { paddingHorizontal: 16, gap: 8 },
    chip: { borderWidth: 1 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
    gridCard: { width: (width - 32 - 12) / 2, borderRadius: 12, overflow: 'hidden' },
    gridImagePlaceholder: { width: '100%', height: 100 },
});
