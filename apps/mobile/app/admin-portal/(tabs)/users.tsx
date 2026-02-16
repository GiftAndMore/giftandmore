import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Avatar, Surface, ActivityIndicator, useTheme, Chip, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, User } from '../../../lib/mock-api';

export default function AdminUsersScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await mockStore.getUsers();
        setUsers(data);
        setLoading(false);
    };

    const filtered = users.filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderItem = ({ item }: { item: User }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <TouchableOpacity onPress={() => router.push(`/admin-portal/users/${item.id}` as any)} style={styles.cardInner}>
                <Avatar.Text size={40} label={item.full_name.substring(0, 2).toUpperCase()} style={{ backgroundColor: item.role === 'admin' ? '#3B82F6' : item.role === 'assistant' ? '#8B5CF6' : '#E5E7EB' }} />
                <View style={styles.details}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.full_name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.email}</Text>
                </View>
                <Chip textStyle={{ fontSize: 10 }}>{item.role.toUpperCase()}</Chip>
            </TouchableOpacity>
        </Surface>
    );

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
    card: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
    cardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    details: { flex: 1, marginLeft: 16 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
