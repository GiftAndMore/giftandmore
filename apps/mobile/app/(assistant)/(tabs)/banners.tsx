import { View, FlatList, Image } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { Banner } from '../../../lib/mock-api/types';
import { useAuth } from '../../../lib/auth';

export default function BannersScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        checkPermissions();
        loadBanners();
    }, []);

    const checkPermissions = async () => {
        if (session?.user?.id) {
            const user = await mockStore.getUser(session.user.id);
            setHasPermission(user?.role === 'admin' || user?.assistant_tasks?.includes('manage_banners') || false);
        }
    };

    const loadBanners = async () => {
        setLoading(true);
        const all = await mockStore.getBanners();
        setBanners(all);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: Banner }) => (
        <Card style={{ marginBottom: 16, marginHorizontal: 16 }} onPress={() => hasPermission && router.push(`/(assistant)/manage-banners/${item.id}`)}>
            <Card.Cover source={{ uri: item.image }} style={{ height: 150 }} />
            <Card.Content style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.title}</Text>
                        <Text variant="bodyMedium">{item.subtitle}</Text>
                    </View>
                    <Chip>{item.is_active ? 'Active' : 'Inactive'}</Chip>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ padding: 16, paddingBottom: 8 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Banners</Text>
            </View>
            <FlatList
                data={banners}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
                refreshing={loading}
                onRefresh={loadBanners}
            />
            {hasPermission && (
                <FAB
                    icon="plus"
                    label="New Banner"
                    style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
                    onPress={() => router.push('/(assistant)/manage-banners/new')}
                />
            )}
        </View>
    );
}
