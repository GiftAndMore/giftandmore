import { View, FlatList, KeyboardAvoidingView, Platform, TextInput as NativeTextInput } from 'react-native';
import { Text, useTheme, IconButton, Card, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { mockStore } from '../../../lib/mock-api';
import { Conversation, Message } from '../../../lib/mock-api/types';
import { useAuth } from '../../../lib/auth';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const { session } = useAuth();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadChat();
    }, [id]);

    const loadChat = async () => {
        const chat = await mockStore.getConversation(id as string);
        if (chat) {
            setConversation(chat);
            setMessages(chat.messages);
            // Mark as assigned if unassigned
            if (chat.status === 'unassigned' && session?.user?.id) {
                // In real app, we would assign it formally
                // mockStore.assignConversation(chat.id, session.user.id);
            }
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || !conversation) return;

        const text = inputText.trim();
        setInputText('');

        await mockStore.addMessage(conversation.id, text, session?.user?.id || 'assistant');

        loadChat();
    };

    const handleResolve = async () => {
        if (!conversation) return;
        try {
            await mockStore.updateConversation(conversation.id, { status: 'resolved' });
            loadChat(); // Refresh to show status change
        } catch (e) {
            console.error(e);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === (session?.user?.id || 'assistant') || item.sender_id === 'admin';
        // Handle potential corrupted data from previous bug
        const displayText = typeof item.text === 'object' ? (item.text as any).text || JSON.stringify(item.text) : item.text;

        return (
            <View style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? theme.colors.primary : theme.colors.surfaceVariant,
                borderRadius: 16,
                borderBottomRightRadius: isMe ? 0 : 16,
                borderBottomLeftRadius: isMe ? 16 : 0,
                padding: 12,
                marginVertical: 4,
                maxWidth: '80%',
                marginHorizontal: 16
            }}>
                <Text style={{ color: isMe ? '#fff' : theme.colors.onSurface }}>{displayText}</Text>
                <Text style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.outline, alignSelf: 'flex-end', marginTop: 4 }}>
                    {new Date(item.created_at || new Date().toISOString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 8 }}>
                    <Avatar.Text size={40} label={conversation?.user_name.substring(0, 2).toUpperCase() || 'U'} />
                    <View style={{ marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{conversation?.user_name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                            {conversation?.status === 'resolved' ? 'Resolved' : 'Order Support'}
                        </Text>
                    </View>
                </View>
                <IconButton icon="check-circle-outline" iconColor={theme.colors.primary} onPress={handleResolve} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: theme.colors.surface }}>
                    <NativeTextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.outline}
                        style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, color: theme.colors.onSurface }}
                        multiline
                        editable={conversation?.status !== 'resolved'}
                    />
                    <IconButton
                        icon="send"
                        mode="contained"
                        containerColor={theme.colors.primary}
                        iconColor="#fff"
                        onPress={sendMessage}
                        style={{ marginLeft: 8 }}
                        disabled={conversation?.status === 'resolved'}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
