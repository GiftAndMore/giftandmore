import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton, Chip, Divider, Appbar, Button, Avatar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrderTracking() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);

    // Mock Order Data
    const mockOrder = {
        id: id || 'ORD-89231',
        status: 'processing',
        date: '15 Feb 2026',
        total: 145000,
        items: [
            { name: 'Luxury Flower Box (Red Roses)', price: 85000, qty: 1, image: 'https://images.unsplash.com/photo-1522673607200-1648832cee48?q=80&w=400' },
            { name: 'Gourmet Chocolate Set', price: 60000, qty: 1, image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=400' }
        ],
        recipient: {
            name: 'Sarah Adebayo',
            address: '15 Admiralty Way, Lekki Phase 1, Lagos',
            phone: '+234 812 345 6789',
            note: 'Happy Birthday Sarah! Hope you love these.'
        },
        timeline: [
            { id: 1, status: 'Order Placed', time: '10:30 AM', date: '15 Feb', completed: true },
            { id: 2, status: 'Payment Confirmed', time: '10:32 AM', date: '15 Feb', completed: true },
            { id: 3, status: 'Processing', time: '11:00 AM', date: '15 Feb', completed: true, current: true },
            { id: 4, status: 'Shipped', time: '--', date: '--', completed: false },
            { id: 5, status: 'Delivered', time: '--', date: '--', completed: false }
        ]
    };

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <Text style={{ color: theme.colors.onSurface }}>Loading details...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => router.push("/(tabs)/orders")} />
                    <Text style={styles.headerTitle}>Track Order</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Order Summary Header */}
                <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <View style={styles.rowBetween}>
                        <View>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Order ID</Text>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>#{mockOrder.id.toString().slice(0, 10).toUpperCase()}</Text>
                        </View>
                        <Chip mode="flat" style={[styles.statusChip, { backgroundColor: theme.colors.primaryContainer }]} textStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold', fontSize: 10 }}>
                            {mockOrder.status.toUpperCase()}
                        </Chip>
                    </View>
                    <Divider style={{ marginVertical: 12 }} />
                    <View style={styles.rowBetween}>
                        <View style={styles.infoBox}>
                            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.primary} />
                            <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>{mockOrder.date}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <MaterialCommunityIcons name="wallet" size={16} color={theme.colors.primary} />
                            <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurface }]}>₦{mockOrder.total.toLocaleString()}</Text>
                        </View>
                    </View>
                </Surface>

                {/* Tracking Progress */}
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Tracking Status</Text>
                <Surface style={[styles.timelineCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    {mockOrder.timeline.map((item, index) => (
                        <View key={item.id} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[
                                    styles.dot,
                                    item.completed ? styles.dotCompleted : styles.dotPending,
                                    item.current && styles.dotCurrent
                                ]}>
                                    {item.completed && <MaterialCommunityIcons name="check" size={12} color="white" />}
                                </View>
                                {index !== mockOrder.timeline.length - 1 && (
                                    <View style={[styles.line, item.completed && styles.lineCompleted]} />
                                )}
                            </View>
                            <View style={styles.timelineRight}>
                                <View style={styles.rowBetween}>
                                    <Text variant="bodyMedium" style={[
                                        styles.statusText,
                                        item.completed ? { color: theme.colors.onSurface, fontWeight: 'bold' } : { color: theme.colors.onSurfaceVariant }
                                    ]}>
                                        {item.status}
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.time}</Text>
                                </View>
                                {item.current && (
                                    <Text variant="bodySmall" style={{ color: theme.colors.primary, fontStyle: 'italic' }}>
                                        Our agent is currently packaging your gift.
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </Surface>

                {/* Gift Details */}
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Gift Items</Text>
                <Surface style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    {mockOrder.items.map((item, index) => (
                        <View key={index}>
                            <View style={styles.itemRow}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text variant="titleSmall" numberOfLines={1} style={{ color: theme.colors.onSurface }}>{item.name}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Qty: {item.qty}</Text>
                                    <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>₦{item.price.toLocaleString()}</Text>
                                </View>
                            </View>
                            {index !== mockOrder.items.length - 1 && <Divider style={{ marginVertical: 12 }} />}
                        </View>
                    ))}
                </Surface>

                {/* Recipient Details */}
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Delivery Details</Text>
                <Surface style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <View style={styles.recipientHeader}>
                        <Avatar.Icon size={36} icon="account-heart" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>{mockOrder.recipient.name}</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{mockOrder.recipient.phone}</Text>
                        </View>
                    </View>
                    <Divider style={{ marginVertical: 12 }} />
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={[styles.recipientText, { color: theme.colors.onSurface }]}>{mockOrder.recipient.address}</Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 12 }]}>
                        <MaterialCommunityIcons name="note-text" size={18} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={[styles.recipientText, { fontStyle: 'italic', color: theme.colors.onSurface }]}>
                            "{mockOrder.recipient.note}"
                        </Text>
                    </View>
                </Surface>

                <Button
                    mode="contained"
                    icon="chat"
                    onPress={() => router.push('/chat')}
                    style={[styles.chatBtn, { backgroundColor: theme.colors.primary }]}
                    contentStyle={{ height: 50 }}
                >
                    Chat with Personal Assistant
                </Button>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        elevation: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 24, marginLeft: 10 },
    scrollContent: { padding: 16 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryCard: { padding: 16, borderRadius: 16, marginBottom: 20 },
    statusChip: { borderRadius: 8 },
    infoBox: { flexDirection: 'row', alignItems: 'center' },
    infoLabel: { marginLeft: 6, fontWeight: '500' },
    sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
    timelineCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
    timelineItem: { flexDirection: 'row', minHeight: 50 },
    timelineLeft: { alignItems: 'center', width: 30 },
    timelineRight: { flex: 1, paddingLeft: 10, paddingBottom: 20 },
    dot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    dotCompleted: { backgroundColor: '#10B981' },
    dotPending: { backgroundColor: '#E5E7EB' },
    dotCurrent: { borderWidth: 3, borderColor: '#D1FAE5' },
    line: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginVertical: -2 },
    lineCompleted: { backgroundColor: '#10B981' },
    statusText: { fontSize: 15 },
    detailsCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemImage: { width: 60, height: 60, borderRadius: 12 },
    recipientHeader: { flexDirection: 'row', alignItems: 'center' },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
    recipientText: { marginLeft: 10, flex: 1 },
    chatBtn: { borderRadius: 12, marginTop: 10 }
});
