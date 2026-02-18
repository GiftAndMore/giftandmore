import { View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Chip, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { CustomRequest } from '../../../lib/mock-api/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RequestsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRequests = async () => {
        if (!refreshing) setLoading(true);
        const all = await mockStore.getRequests();
        // Sort by newest first
        const sorted = all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRequests(sorted);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadRequests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return '#EC4899';
            case 'quoted': return '#8B5CF6';
            case 'accepted': return '#10B981';
            case 'rejected': return '#EF4444';
            default: return theme.colors.outline;
        }
    };

    const renderItem = ({ item }: { item: CustomRequest }) => (
        <Surface style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 16, backgroundColor: theme.colors.surface, elevation: 1 }} mode="flat">
            <TouchableOpacity onPress={() => router.push(`/(assistant)/manage-requests/${item.id}`)}>
                <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.secondaryContainer, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <MaterialCommunityIcons name="clipboard-text" size={20} color={theme.colors.secondary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }} numberOfLines={1}>{item.title || 'Custom Request'}</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <Chip textStyle={{ fontSize: 10, lineHeight: 10, color: '#fff' }} style={{ backgroundColor: getStatusColor(item.status), height: 24, marginLeft: 8 }}>
                            {item.status.toUpperCase()}
                        </Chip>
                    </View>

                    <Text variant="bodyMedium" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                        {item.description}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant, paddingTop: 12 }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Budget</Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            ₦{item.budget.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Surface>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 24, paddingTop: 60, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="arrow-left" iconColor="#fff" onPress={() => router.back()} style={{ marginLeft: -8 }} />
                        <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold' }}>Requests</Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{requests.length}</Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
                        <MaterialCommunityIcons name="clipboard-text-off" size={48} color={theme.colors.outline} />
                        <Text style={{ marginTop: 16 }}>No requests found</Text>
                    </View>
                }
            />
        </View>
    );
}
