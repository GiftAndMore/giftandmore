import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, ActivityIndicator, useTheme, Chip, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, Conversation } from '../../../lib/mock-api';

export default function AdminSupportScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        // In real app, we'd fetch from SupportRepo
        const data = await mockStore.conversations;
        setConversations(data);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <TouchableOpacity onPress={() => router.push(`/admin-portal/support/${item.id}` as any)} style={styles.cardInner}>
                <Avatar.Icon size={40} icon="account" style={{ backgroundColor: '#E5E7EB' }} />
                <View style={styles.details}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.user_name}</Text>
                    <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{item.messages[item.messages.length - 1].text}</Text>
                </View>
                <Chip style={{ backgroundColor: item.status === 'unassigned' ? theme.colors.errorContainer : theme.colors.secondaryContainer }}>
                    {item.status}
                </Chip>
            </TouchableOpacity>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>Support Queue</Text>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurfaceVariant }}>No active chats.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 10 },
    card: { marginBottom: 12, borderRadius: 12 },
    cardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    details: { flex: 1, marginLeft: 16 },
});
