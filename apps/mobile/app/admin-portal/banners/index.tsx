import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Card, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, Banner } from '../../../lib/mock-api';

export default function BannerListScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBanners = async () => {
        try {
            const data = await mockStore.getBanners();
            setBanners(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadBanners();
    };

    const renderItem = ({ item }: { item: Banner }) => (
        <Card style={styles.card} onPress={() => router.push(`/admin-portal/banners/${item.id}` as any)}>
            <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
            <Card.Content style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.title}</Text>
                    <Chip style={{ backgroundColor: item.is_active ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                </View>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.subtitle}</Text>
                <Text variant="bodySmall" style={{ marginTop: 4 }}>Link: {item.link_target}</Text>
            </Card.Content>
        </Card>
    );

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Manage Banners</Text>
            </View>

            <FlatList
                data={banners}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No banners found.</Text>}
            />

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={() => router.push('/admin-portal/banners/new')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 40 },
    card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
    cardImage: { height: 150 },
    cardContent: { paddingTop: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
