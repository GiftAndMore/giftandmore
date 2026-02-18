import { View, FlatList } from 'react-native';
import { Text, List, FAB, useTheme, Card, Chip, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { Conversation } from '../../../lib/mock-api/types';
import { useAuth } from '../../../lib/auth';

// Screen for listing conversations for the assistant
export default function LiveAgentScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setLoading(true);
        // In real app, we filter by permissions or assignments
        const all = await mockStore.getConversations();
        setConversations(all);
        setLoading(false);
    };

    const getLastMessageText = (conversation: Conversation) => {
        const lastMsg = conversation.messages[conversation.messages.length - 1];
        if (!lastMsg) return '';
        if (typeof lastMsg.text === 'object') {
            return (lastMsg.text as any).text || 'Message content unavailable';
        }
        return lastMsg.text;
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <Card style={{ marginBottom: 12, marginHorizontal: 16 }} onPress={() => router.push(`/(assistant)/live-agent/${item.id}`)}>
            <Card.Title
                title={item.user_name}
                subtitle={getLastMessageText(item)}
                left={(props) => <List.Icon {...props} icon="account" />}
                right={(props) =>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                        <Chip textStyle={{ fontSize: 10, lineHeight: 10 }} style={{ height: 24, backgroundColor: item.status === 'unassigned' ? theme.colors.errorContainer : theme.colors.primaryContainer }}>
                            {item.status.toUpperCase()}
                        </Chip>
                    </View>
                }
            />
        </Card>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ padding: 16, paddingBottom: 8 }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Support Chats</Text>
            </View>
            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
                refreshing={loading}
                onRefresh={loadConversations}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No active conversations</Text>}
            />
            {/* Mock FAB to simulate new chat if needed, or maybe just refresh */}
            <FAB
                icon="refresh"
                style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
                onPress={loadConversations}
            />
        </View>
    );
}
