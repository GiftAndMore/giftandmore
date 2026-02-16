import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Surface, IconButton, useTheme, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NotificationType = 'order' | 'promo' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #1023 has been delivered successfully. Enjoy!',
        time: '2 hours ago',
        read: false,
    },
    {
        id: '2',
        type: 'promo',
        title: 'Valentine\'s Special',
        message: 'Get 20% off all romantic gift sets. Limited time offer!',
        time: '1 day ago',
        read: true,
    },
    {
        id: '3',
        type: 'system',
        title: 'Welcome!',
        message: 'Thanks for joining Gifts & More. Start exploring our curations.',
        time: '3 days ago',
        read: true,
    },
    {
        id: '4',
        type: 'order',
        title: 'Order Shipped',
        message: 'Order #1023 is on its way to you.',
        time: '4 days ago',
        read: true,
    }
];

export default function NotificationScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'order': return 'package-variant';
            case 'promo': return 'tag-heart';
            case 'system': return 'bell-ring';
            default: return 'bell';
        }
    };

    const getColor = (type: NotificationType) => {
        switch (type) {
            case 'order': return '#3B82F6'; // Blue
            case 'promo': return '#EC4899'; // Pink
            case 'system': return '#F59E0B'; // Amber
            default: return theme.colors.primary;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <Surface style={[styles.card, { backgroundColor: item.read ? theme.colors.surface : theme.colors.surfaceVariant }]} elevation={1}>
            <View style={styles.row}>
                <Avatar.Icon
                    icon={getIcon(item.type)}
                    size={48}
                    style={{ backgroundColor: getColor(item.type) + '20' }}
                    color={getColor(item.type)}
                />
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text variant="titleMedium" style={{ fontWeight: item.read ? 'normal' : 'bold' }}>{item.title}</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.time}</Text>
                    </View>
                    <Text variant="bodyMedium" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        {item.message}
                    </Text>
                </View>
                {!item.read && <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />}
            </View>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton
                        icon="arrow-left"
                        iconColor="white"
                        onPress={() => router.back()}
                        style={{ marginLeft: -8 }}
                    />
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: 'white', marginLeft: 4 }}>Notifications</Text>
                </View>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-off-outline" size={64} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 4,
    },
    listContent: { padding: 16, gap: 12 },
    card: {
        borderRadius: 12,
        padding: 16,
        overflow: 'hidden'
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    content: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 }
});
