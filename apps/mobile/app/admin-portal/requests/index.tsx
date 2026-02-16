import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, IconButton, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, CustomRequest } from '../../../lib/mock-api';

export default function RequestListScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRequests = async () => {
        try {
            const data = await mockStore.getRequests();
            // Sort by new first
            setRequests(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadRequests();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return theme.colors.errorContainer;
            case 'in_review': return theme.colors.secondaryContainer;
            case 'quoted': return theme.colors.primaryContainer;
            case 'paid': return '#D1FAE5'; // Success color
            default: return theme.colors.surfaceVariant;
        }
    };

    const renderItem = ({ item }: { item: CustomRequest }) => (
        <Card style={styles.card} onPress={() => router.push(`/admin-portal/requests/${item.id}` as any)}>
            <Card.Content>
                <View style={styles.row}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.purpose}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) }}>{item.status}</Chip>
                </View>
                <Text variant="bodyMedium" style={{ marginTop: 4 }}>User: {item.user_name}</Text>
                <Text variant="bodyMedium">Budget: {item.budget}</Text>
                <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </Card.Content>
        </Card>
    );

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Custom Requests</Text>
            </View>

            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No requests found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 40 },
    card: { marginBottom: 12, borderRadius: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
