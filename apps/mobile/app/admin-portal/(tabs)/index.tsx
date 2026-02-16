import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Surface, IconButton, ActivityIndicator, Button, useTheme, Avatar, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, ActivityEvent } from '../../../lib/mock-api';
import { useAdminAuth } from '../../../lib/admin-auth';

export default function AdminDashboardScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { signOutAdmin } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [kpis, setKpis] = useState({ totalOrders: 0, pendingEscalations: 0, revenue: 0, activeUsers: 0, pendingRequests: 0, totalBanners: 0 });
    const [activity, setActivity] = useState<ActivityEvent[]>([]);

    const loadData = async () => {
        try {
            const [kpiData, activityData] = await Promise.all([
                mockStore.getKPIs(),
                mockStore.getActivity()
            ]);
            setKpis(kpiData);
            setActivity(activityData.slice(0, 10)); // Top 10
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
                <IconButton icon="logout" onPress={signOutAdmin} iconColor={theme.colors.error} />
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
            </View>

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
