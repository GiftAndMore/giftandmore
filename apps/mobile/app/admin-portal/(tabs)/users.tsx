import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Avatar, Surface, ActivityIndicator, useTheme, Chip, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { mockStore, User } from '../../../lib/mock-api';

type FilterTab = 'all' | 'online' | 'offline';

const timeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export default function AdminUsersScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('all');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        const data = await mockStore.getUsers();
        setUsers(data);
        setLoading(false);
    };

    const filtered = users.filter(u => {
        const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (filterTab === 'online') return u.role === 'assistant' && u.assistant_status === 'online';
        if (filterTab === 'offline') return u.role === 'assistant' && u.assistant_status !== 'online';
        return true;
    });

    const onlineCount = users.filter(u => u.role === 'assistant' && u.assistant_status === 'online').length;
    const offlineCount = users.filter(u => u.role === 'assistant' && u.assistant_status !== 'online').length;

    const renderItem = ({ item }: { item: User }) => {
        const isAssistant = item.role === 'assistant';
        const isOnline = isAssistant && item.assistant_status === 'online';

        return (
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <TouchableOpacity onPress={() => router.push(`/admin-portal/users/${item.id}` as any)} style={styles.cardInner}>
                    <View>
                        <Avatar.Text size={40} label={(item.full_name || '?').substring(0, 2).toUpperCase()} style={{ backgroundColor: item.role === 'admin' ? '#3B82F6' : item.role === 'assistant' ? '#8B5CF6' : '#E5E7EB' }} />
                        {isAssistant && (
                            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22C55E' : '#6B7280', borderColor: theme.colors.surface }]} />
                        )}
                    </View>
                    <View style={styles.details}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.full_name || 'Unknown User'}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.email}</Text>
                        {isAssistant && !isOnline && item.last_active && (
                            <Text variant="bodySmall" style={{ color: theme.colors.outline, fontSize: 11, marginTop: 2 }}>
                                Last seen: {timeAgo(item.last_active)}
                            </Text>
                        )}
                        {isAssistant && isOnline && (
                            <Text variant="bodySmall" style={{ color: '#22C55E', fontSize: 11, marginTop: 2 }}>
                                Online now
                            </Text>
                        )}
                    </View>
                    <Chip textStyle={{ fontSize: 10 }}>{item.role.toUpperCase()}</Chip>
                </TouchableOpacity>
            </Surface>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Users & Staff</Text>
                <Searchbar
                    placeholder="Search users..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ backgroundColor: theme.colors.surface }}
                />
                {/* Filter Tabs */}
                <View style={styles.filterRow}>
                    <Chip
                        selected={filterTab === 'all'}
                        onPress={() => setFilterTab('all')}
                        style={[styles.filterChip, filterTab === 'all' && { backgroundColor: theme.colors.primaryContainer }]}
                        textStyle={{ color: filterTab === 'all' ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant, fontSize: 12 }}
                    >
                        All ({users.length})
                    </Chip>
                    <Chip
                        selected={filterTab === 'online'}
                        onPress={() => setFilterTab('online')}
                        style={[styles.filterChip, filterTab === 'online' && { backgroundColor: '#16A34A20' }]}
                        textStyle={{ color: filterTab === 'online' ? '#22C55E' : theme.colors.onSurfaceVariant, fontSize: 12 }}
                        icon={() => <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />}
                    >
                        Online ({onlineCount})
                    </Chip>
                    <Chip
                        selected={filterTab === 'offline'}
                        onPress={() => setFilterTab('offline')}
                        style={[styles.filterChip, filterTab === 'offline' && { backgroundColor: '#6B728020' }]}
                        textStyle={{ color: filterTab === 'offline' ? '#9CA3AF' : theme.colors.onSurfaceVariant, fontSize: 12 }}
                        icon={() => <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B7280' }} />}
                    >
                        Offline ({offlineCount})
                    </Chip>
                </View>
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
                icon="account-plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                label="New Assistant"
                onPress={() => router.push('/admin-portal/users/create-assistant')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 10 },
    filterRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    filterChip: { height: 32 },
    card: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
    cardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    details: { flex: 1, marginLeft: 16 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
    statusDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
});
