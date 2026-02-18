import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Surface, IconButton, ActivityIndicator, Button, useTheme, Avatar, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { mockStore, ActivityEvent, User } from '../../../lib/mock-api';
import { useAdminAuth } from '../../../lib/admin-auth';

export default function AdminDashboardScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { signOutAdmin } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [kpis, setKpis] = useState({ totalOrders: 0, pendingEscalations: 0, revenue: 0, activeUsers: 0, pendingRequests: 0, totalBanners: 0, onlineAssistants: 0, totalAssistants: 0 });
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [onlineAssistants, setOnlineAssistants] = useState<User[]>([]);

    const loadData = async () => {
        try {
            const [kpiData, activityData, assistants] = await Promise.all([
                mockStore.getKPIs(),
                mockStore.getActivity(),
                mockStore.getAssistants()
            ]);
            setKpis(kpiData);
            setActivity(activityData.slice(0, 10)); // Top 10
            setOnlineAssistants(assistants.filter(a => a.assistant_status === 'online'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const KPICard = ({ title, value, icon, color, onPress }: any) => (
        <Surface style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{title}</Text>
                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{value}</Text>
                </View>
                <Avatar.Icon size={40} icon={icon} style={{ backgroundColor: color }} color="white" />
            </View>
            {onPress && <Button mode="text" compact onPress={onPress} style={{ marginTop: 4, marginLeft: -8 }}>View</Button>}
        </Surface>
    );

    const ActivityItem = ({ item }: { item: ActivityEvent }) => (
        <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }}>{item.description}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View>
                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>Dashboard</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Welcome back, Admin</Text>
                </View>
                <IconButton icon="account-circle" onPress={() => router.push('/admin-portal/(tabs)/profile')} iconColor={theme.colors.primary} size={30} />
            </View>

            <View style={styles.kpiGrid}>
                <KPICard
                    title="Total Orders"
                    value={kpis.totalOrders}
                    icon="package-variant"
                    color="#3B82F6"
                    onPress={() => router.push('/admin-portal/(tabs)/orders')}
                />
                <KPICard
                    title="Revenue"
                    value={`₦${(kpis.revenue / 1000).toFixed(1)}k`}
                    icon="cash"
                    color="#10B981"
                />
                <KPICard
                    title="Pending Support"
                    value={kpis.pendingEscalations}
                    icon="face-agent"
                    color="#F59E0B"
                    onPress={() => router.push('/admin-portal/(tabs)/support')}
                />
                <KPICard
                    title="Banners"
                    value={kpis.totalBanners || 0}
                    icon="view-carousel"
                    color="#EC4899"
                    onPress={() => router.push('/admin-portal/banners')}
                />
                <KPICard
                    title="New Requests"
                    value={kpis.pendingRequests}
                    icon="creation"
                    color="#8B5CF6"
                    onPress={() => router.push('/admin-portal/requests')}
                />
                <KPICard
                    title="Assistants"
                    value={`${kpis.onlineAssistants}/${kpis.totalAssistants}`}
                    icon="account-check"
                    color="#06B6D4"
                    onPress={() => router.push('/admin-portal/(tabs)/users')}
                />
            </View>

            {/* Online Assistants Row */}
            {onlineAssistants.length > 0 && (
                <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Online Now</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
                            <Text variant="bodySmall" style={{ color: '#22C55E' }}>{onlineAssistants.length} active</Text>
                        </View>
                    </View>
                    <Divider />
                    <View style={{ flexDirection: 'row', padding: 16, gap: 12, flexWrap: 'wrap' }}>
                        {onlineAssistants.map(a => (
                            <View key={a.id} style={{ alignItems: 'center', width: 64 }}>
                                <View>
                                    <Avatar.Text size={40} label={(a.full_name || '?').substring(0, 2).toUpperCase()} style={{ backgroundColor: '#8B5CF6' }} />
                                    <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: theme.colors.surface }} />
                                </View>
                                <Text variant="bodySmall" style={{ marginTop: 4, textAlign: 'center', fontSize: 11 }} numberOfLines={1}>{(a.full_name || '').split(' ')[0]}</Text>
                            </View>
                        ))}
                    </View>
                </Surface>
            )}

            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Recent Activity</Text>
                    <Button onPress={() => loadData()}>Refresh</Button>
                </View>
                <Divider />
                <View style={{ padding: 16 }}>
                    {activity.map((item) => <ActivityItem key={item.id} item={item} />)}
                </View>
            </Surface>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
    kpiCard: { width: '45%', margin: '2.5%', padding: 16, borderRadius: 16 },
    section: { margin: 20, borderRadius: 16, overflow: 'hidden' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    dot: { width: 8, height: 8, borderRadius: 4 },
});
