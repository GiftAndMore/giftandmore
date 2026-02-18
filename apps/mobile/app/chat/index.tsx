import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Surface, IconButton, Appbar, FAB, useTheme, TouchableRipple, Avatar, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockStore } from '../../lib/mock-api';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default function ChatList() {
    const router = useRouter();
    const theme = useTheme();
    const [conversations, setConversations] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    async function fetchConversations() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let allConversations: any[] = [];

        // 1. Fetch from Supabase
        const { data: supabaseData } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id);

        if (supabaseData) {
            allConversations = [...supabaseData];
        }

        // 2. Fetch from Mock Store (Demo Mode)
        const mockData = await mockStore.getConversations();
        const userMockData = mockData.filter(c => c.user_id === user.id);

        // Merge and uniquely identify by ID (though they shouldn't overlap if IDs are distinct)
        const merged = [...allConversations];
        userMockData.forEach(mc => {
            if (!merged.find(c => c.id === mc.id)) {
                merged.push({
                    ...mc,
                    updated_at: (mc as any).last_message_at || (mc as any).created_at // Normalize for sorting
                });
            }
        });

        // 3. Sort by updated_at
        merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        setConversations(merged);
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchConversations();
        setRefreshing(false);
    };

    async function startNewSupportChat() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000001'; // Fallback for testing

            // 1. Create Conversation
            const { data: conv, error: convError } = await supabase
                .from('conversations')
                .insert({ user_id: userId, type: 'support', title: 'Support Chat' })
                .select()
                .single();

            if (convError) {
                console.warn('Supabase conversation creation failed, using mock ID:', convError);
                const mockConvId = `mock-${Date.now()}`;
                router.push({ pathname: '/chat/room', params: { conversationId: mockConvId } });
                return;
            }

            if (conv) {
                // 2. Insert Welcome Message from Bot
                const { error: msgError } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conv.id,
                        sender_id: '00000000-0000-0000-0000-000000000000', // Mock Bot ID
                        content: "Hello! Welcome to our Support. How can we help you today? Please select an option below:",
                        sender_type: 'bot'
                    });

                if (msgError) console.warn('Bot welcome message insert failed:', msgError);

                router.push({ pathname: '/chat/room', params: { conversationId: conv.id } });
            }
        } catch (err) {
            console.warn('startNewSupportChat error, fallback to mock:', err);
            const mockId = `mock-${Date.now()}`;
            router.push({ pathname: '/chat/room', params: { conversationId: mockId } });
        }
    }

    const renderItem = ({ item }: { item: any }) => (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={1}>
            <TouchableRipple
                onPress={() => router.push({ pathname: '/chat/room', params: { conversationId: item.id } })}
                style={styles.ripple}
            >
                <View style={styles.cardInner}>
                    <Avatar.Icon
                        size={48}
                        icon="chat-processing-outline"
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        color={theme.colors.onPrimaryContainer}
                    />
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                    {item.title || 'Support Chat'}
                                </Text>
                                {item.status === 'pending' && (
                                    <Surface style={[styles.statusBadge, { backgroundColor: theme.colors.secondaryContainer }]} elevation={0}>
                                        <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>Pending Review</Text>
                                    </Surface>
                                )}
                            </View>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {new Date(item.updated_at).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                            Tap to continue conversation...
                        </Text>
                    </View>
                    <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} size={24} />
                </View>
            </TouchableRipple>
        </Surface>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => router.back()} />
                    <Text style={styles.headerTitle}>Support & Feedback</Text>
                </View>
            </View>

            <FlatList
                contentContainerStyle={styles.list}
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="message-off-outline" size={80} color={theme.colors.surfaceVariant} />
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>No messages yet</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                            Start a new support chat to get help from our team.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={startNewSupportChat}
                            style={{ marginTop: 20 }}
                            buttonColor={theme.colors.primary}
                            textColor="white"
                            icon="chat-plus"
                        >
                            Start New Chat
                        </Button>
                    </View>
                }
            />

            <FAB
                icon="plus"
                label="New Chat"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={startNewSupportChat}
            />
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
    list: { padding: 16, paddingBottom: 100 },
    card: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
    ripple: { padding: 12 },
    cardInner: { flexDirection: 'row', alignItems: 'center' },
    cardContent: { flex: 1, marginLeft: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        borderRadius: 28,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
});
