import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Card, IconButton, ActivityIndicator, Avatar, Divider, Menu } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockStore, Conversation, User } from '../../../lib/mock-api';
import { useAdminAuth } from '../../../lib/admin-auth';

export default function SupportDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();
    const { adminUser } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [assistants, setAssistants] = useState<User[]>([]);

    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [convData, usersData] = await Promise.all([
                mockStore.getConversation(id as string),
                mockStore.getUsers()
            ]);

            if (convData) {
                setConversation(convData);
                setAssistants(usersData.filter(u => u.role === 'assistant' && u.assistant_enabled));
            } else {
                Alert.alert('Error', 'Conversation not found');
                router.back();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversation) return;
        setSending(true);
        try {
            const msg = await mockStore.addMessage(conversation.id, newMessage, 'admin'); // 'admin' or actual admin ID
            setConversation(prev => prev ? { ...prev, messages: [...prev.messages, msg!] } : null);
            setNewMessage('');
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (e) {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleAssign = async (assistantId: string) => {
        setMenuVisible(false);
        setAssigning(true);
        try {
            const updated = await mockStore.updateConversation(conversation!.id, {
                assigned_to: assistantId,
                status: 'assigned'
            });
            setConversation(prev => prev ? { ...prev, ...updated } : null);
            Alert.alert('Success', 'Conversation assigned');
        } catch (e) {
            Alert.alert('Error', 'Failed to assign conversation');
        } finally {
            setAssigning(false);
        }
    };

    const handleTakeOver = async () => {
        // "Join" just means the admin participates, but maybe we want to assign it to them or mark as 'resolved'?
        // For now, let's just mark it as assigned to 'admin' (if we had an admin ID) or just keep it as is but admin sends messages.
        // The user asked to "join the conversation".
        Alert.alert('Joined', 'You can now reply directly to the user.');
    };

    const handleResolve = async () => {
        setAssigning(true);
        try {
            const updated = await mockStore.updateConversation(conversation!.id, { status: 'resolved' });
            setConversation(prev => prev ? { ...prev, ...updated } : null);
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
    if (!conversation) return null;

    const assignedAssistant = assistants.find(a => a.id === conversation.assigned_to);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{conversation.user_name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Status: {conversation.status} • Assigned: {assignedAssistant ? assignedAssistant.full_name : 'Unassigned'}
                    </Text>
                </View>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={<IconButton icon="account-plus" onPress={() => setMenuVisible(true)} />}
                >
                    <Menu.Item title="Assign to..." disabled />
                    <Divider />
                    {assistants.map(a => (
                        <Menu.Item
                            key={a.id}
                            onPress={() => handleAssign(a.id)}
                            title={`${a.full_name} (${a.assistant_status})`}
                        />
                    ))}
                    {assistants.length === 0 && <Menu.Item title="No assistants available" disabled />}
                </Menu>
                <IconButton icon="check-circle" iconColor={theme.colors.primary} onPress={handleResolve} />
            </View>

            <FlatList
                ref={flatListRef}
                data={conversation.messages}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const isMe = item.sender_id === 'admin' || item.sender_id === adminUser?.id;
                    const isSystem = item.sender_id === 'system';

                    if (isSystem) {
                        return (
                            <View style={{ alignItems: 'center', marginVertical: 8 }}>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{item.text}</Text>
                            </View>
                        );
                    }

                    return (
                        <View style={[
                            styles.messageBubble,
                            isMe ? styles.myMessage : styles.theirMessage,
                            { backgroundColor: isMe ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
                        ]}>
                            <Text style={{ color: isMe ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}>{item.text}</Text>
                            <Text variant="labelSmall" style={{ alignSelf: 'flex-end', marginTop: 4, opacity: 0.7 }}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                    <TextInput
                        mode="outlined"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        style={{ flex: 1, backgroundColor: theme.colors.surface }}
                        right={<TextInput.Icon icon="send" onPress={handleSendMessage} disabled={sending || !newMessage.trim()} />}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#eee' },
    messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
    myMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    theirMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
});
