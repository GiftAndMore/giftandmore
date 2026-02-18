import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Avatar, useTheme, Chip, List, ActivityIndicator, Surface } from 'react-native-paper';
import { useAuth } from '../../../lib/auth';
import { useEffect, useState, useCallback } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { User, ActivityEvent } from '../../../lib/mock-api/types';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AssistantOverview() {
    const { session, signOut } = useAuth();
    const theme = useTheme();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [stats, setStats] = useState({
        assignedChats: 0,
        assignedOrders: 0,
        pendingRequests: 0,
        products: 0,
        banners: 0
    });

    const loadData = async () => {
        if (!session?.user?.id) return;
        if (!refreshing && !userProfile) setLoading(true);

        try {
            const user = await mockStore.getUser(session.user.id);
            setUserProfile(user || null);

            const allOrders = await mockStore.getOrders();
            const allChats = await mockStore.getConversations();
            const allRequests = await mockStore.getRequests();
            const allProducts = await mockStore.getProducts();
            const allBanners = await mockStore.getBanners();
            const allActivity = await mockStore.getActivity();

            setStats({
                assignedOrders: allOrders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
                assignedChats: allChats.filter(c => c.status === 'unassigned').length,
                pendingRequests: allRequests.filter(r => r.status === 'new').length,
                products: allProducts.length,
                banners: allBanners.length
            });

            setActivities(allActivity.slice(0, 10));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Auto-set online when dashboard mounts
    useEffect(() => {
        if (session?.user?.id) {
            mockStore.setAvailability(session.user.id, 'online');
        }
    }, [session?.user?.id]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    if (loading && !userProfile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const hasPermission = (task: string) => userProfile?.assistant_tasks?.includes(task as any);

    const StatCard = ({ icon, label, value, color, onPress }: any) => (
        <TouchableOpacity onPress={onPress} style={{ flex: 1 }} activeOpacity={0.7}>
            <Surface style={{ padding: 14, borderRadius: 14, alignItems: 'center', elevation: 1, backgroundColor: theme.colors.surface }} mode="flat">
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                    <MaterialCommunityIcons name={icon} size={20} color={color} />
                </View>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{value}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 11, marginTop: 2 }}>{label}</Text>
            </Surface>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Header */}
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 20, paddingTop: 56, paddingBottom: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold' }}>Dashboard</Text>
                            <Text variant="bodyMedium" style={{ color: '#fff', opacity: 0.9 }}>Welcome, {userProfile?.full_name?.split(' ')[0]}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/assistant-profile')}>
                            <View>
                                <Avatar.Image size={44} source={{ uri: userProfile?.avatar }} />
                                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)' }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={{ padding: 16, marginTop: -16 }}>
                    {/* Stats Grid - 2x2 */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        {hasPermission('live_agent_support') &&
                            <View style={{ width: '48%' }}><StatCard icon="headset" label="Support Chats" value={stats.assignedChats} color="#8B5CF6" onPress={() => router.push('/(assistant)/(tabs)/live-agent')} /></View>
                        }
                        {hasPermission('update_orders') &&
                            <View style={{ width: '48%' }}><StatCard icon="package-variant" label="Active Orders" value={stats.assignedOrders} color="#F59E0B" onPress={() => router.push('/assistant-orders')} /></View>
                        }
                        {hasPermission('manage_custom_requests') &&
                            <View style={{ width: '48%' }}><StatCard icon="clipboard-text" label="Requests" value={stats.pendingRequests} color="#EC4899" onPress={() => router.push('/(assistant)/(tabs)/requests')} /></View>
                        }
                        {(hasPermission('add_products') || hasPermission('manage_products')) &&
                            <View style={{ width: '48%' }}><StatCard icon="tag" label="Products" value={stats.products} color="#10B981" onPress={() => router.push('/(assistant)/(tabs)/products')} /></View>
                        }
                    </View>

                    {/* Access Rights */}
                    <Text variant="titleMedium" style={{ marginTop: 20, marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }}>Access Rights</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        {userProfile?.assistant_tasks?.map(task => (
                            <Chip
                                key={task}
                                icon="shield-check"
                                style={{ backgroundColor: theme.colors.surfaceVariant }}
                                textStyle={{ fontSize: 11 }}
                                compact
                            >
                                {task.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </Chip>
                        ))}
                    </View>

                    {/* Recent Activity */}
                    <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }}>Recent Activity</Text>
                    <Surface style={{ borderRadius: 12, backgroundColor: theme.colors.surface, elevation: 1 }}>
                        {activities.length > 0 ? activities.map((activity, index) => (
                            <List.Item
                                key={activity.id}
                                title={activity.description}
                                titleNumberOfLines={2}
                                titleStyle={{ fontSize: 13 }}
                                description={new Date(activity.created_at).toLocaleString()}
                                descriptionStyle={{ fontSize: 11 }}
                                left={props => <List.Icon {...props} icon={
                                    activity.type.includes('order') ? 'package-variant' :
                                        activity.type.includes('product') ? 'tag' :
                                            activity.type.includes('assistant') ? 'account' : 'bell'
                                } color={theme.colors.primary} />}
                                style={[
                                    { paddingVertical: 4 },
                                    index < activities.length - 1 ? { borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant } : {}
                                ]}
                            />
                        )) : (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>No recent activity</Text>
                            </View>
                        )}
                    </Surface>
                </View>
            </ScrollView>
        </View>
    );
}
