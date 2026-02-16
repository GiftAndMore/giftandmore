import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TextInput, Button, Surface, Appbar, Avatar, useTheme, IconButton, Chip } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ChatMediaAttachment from '../../components/ChatMediaAttachment';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

const BOT_OPTIONS = [
    { label: "Request a custom gift", value: "custom_request" },
    { label: "Track my order", value: "track_order" },
    { label: "Return policy", value: "return_policy" },
    { label: "FAQ", value: "faq" },
    { label: "Make a complain", value: "complain" },
    { label: "Delay delivery", value: "delay" },
    { label: "Damage goods", value: "damage" },
    { label: "Wrong gift delivered", "value": "wrong_gift" },
    { label: "Cancel my order", value: "cancel" },
];

// Chat Room Responsiveness improvements:
// - Keyboard Handling: Optimized `KeyboardAvoidingView` specifically for Android to ensure the message input field is correctly pushed up and not covered by the keyboard.
// - Scroll Improvements: Fixed the issue where users couldn't see what they were typing; the chatbot screen now correctly adjusts its height to maintain visibility.

const BOT_RESPONSES: Record<string, string> = {
    custom_request: "You can create a custom request directly from the Home screen or by visiting the 'Custom Request' tab. We'll provide you with quotes within 24 hours!",
    track_order: "To track your order, please visit the 'Orders' tab and click on the specific order. You'll see real-time updates there.",
    return_policy: "Our return policy allows for returns within 48 hours for damaged or wrong items. Please ensure the packaging is intact.",
    faq: "Visit our Help Center in the Profile tab for a full list of FAQs, or ask me something specific here!",
    complain: "We're sorry to hear that. Please describe your issue in detail, and a human agent will join this chat shortly to assist you.",
    delay: "We apologize for the delay. We are looking into it and will provide an update within the hour.",
    damage: "Oh no! Please take a photo of the damaged item and upload it here. We'll initiate a replacement or refund immediately.",
    wrong_gift: "We apologize for the mistake. Please upload a photo of the item you received, and we'll send the correct one right away.",
    cancel: "To cancel an order, go to the 'Orders' tab. If the order hasn't been processed yet, you'll see a 'Cancel' button there.",
};

export default function ChatRoom() {
    const { conversationId, orderId } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [activeConvId, setActiveConvId] = useState<string | null>(conversationId as string);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        initializeChat();
    }, [conversationId, orderId]);

    async function initializeChat() {
        try {
            let convId = conversationId;
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000001';

            if (String(convId).startsWith('mock')) {
                setActiveConvId(convId as string);
                setMessages([
                    {
                        id: 'welcome-1',
                        sender_type: 'bot',
                        content: "Hello! Welcome to our Support. This is a Demo Chat Mode. How can we help you today? Please select an option below:",
                        created_at: new Date().toISOString()
                    }
                ]);
                setShowOptions(true);
                return;
            }

            if (!convId && orderId) {
                const { data } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('order_id', orderId)
                    .single();

                if (data) convId = data.id;
                else {
                    const { data: newConv } = await supabase
                        .from('conversations')
                        .insert({ user_id: userId, type: 'order', order_id: orderId, title: `Order #${orderId.slice(0, 8)}` })
                        .select()
                        .single();
                    if (newConv) convId = newConv.id;
                    else {
                        // Fallback if conversation creation fails
                        setActiveConvId('mock-order');
                        setMessages([{ id: 'm1', content: "Order support started (Demo).", sender_type: 'bot' }]);
                        return;
                    }
                }
            }

            if (convId) {
                setActiveConvId(convId as string);
                fetchMessages(convId as string);
                subscribeToMessages(convId as string);
            }
        } catch (err) {
            console.warn('initializeChat error, fallback to mock:', err);
            setActiveConvId('mock-fallback');
            setMessages([{
                id: 'm-err',
                content: "Welcome! We're in Demo Chat Mode as we couldn't connect to the server. How can we help?",
                sender_type: 'bot',
                created_at: new Date().toISOString()
            }]);
            setShowOptions(true);
        }
    }

    async function fetchMessages(convId: string) {
        const { data } = await supabase
            .from('messages')
            .select('*, message_attachments(*)')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false });
        if (data) {
            setMessages(data);
            // Show options if the last message is from bot and has the welcome text
            const lastBotMsg = data.find(m => m.sender_type === 'bot');
            if (lastBotMsg && lastBotMsg.content.includes("Please select an option below")) {
                setShowOptions(true);
            }
        }
    }

    function subscribeToMessages(convId: string) {
        const channel = supabase
            .channel(`chat-${convId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
                (payload) => {
                    setMessages((prev) => [payload.new, ...prev]);
                    if (payload.new.sender_type === 'bot' && payload.new.content.includes("Please select an option below")) {
                        setShowOptions(true);
                    }
                }
            )
            .subscribe();
        return () => supabase.removeChannel(channel);
    }

    async function sendMessage(text: string = inputText, type: string = 'text', attachmentUrl?: string, senderType: string = 'user') {
        if ((!text.trim() && !attachmentUrl) || !activeConvId) return;

        // Mock mode handling
        if (String(activeConvId).startsWith('mock')) {
            const newMessage = {
                id: `local-${Date.now()}`,
                conversation_id: activeConvId,
                content: text,
                sender_type: senderType,
                created_at: new Date().toISOString(),
                message_attachments: attachmentUrl ? [{ id: 'att-1', path: attachmentUrl }] : []
            };
            setMessages(prev => [newMessage, ...prev]);
            if (senderType === 'user') {
                setInputText('');
                // Mock bot response for 'help'
                if (text.toLowerCase().includes('help')) {
                    setShowOptions(true);
                }
            }
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '00000000-0000-0000-0000-000000000001';

        const { data: msg, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: activeConvId,
                sender_id: senderType === 'user' ? userId : '00000000-0000-0000-0000-000000000000',
                content: text,
                sender_type: senderType
            })
            .select()
            .single();

        if (error) {
            console.warn('Message send failed (Supabase), using mock local append:', error);
            // Even if DB fails, allow user to see their message locally for Demo
            setMessages(prev => [{ id: `err-${Date.now()}`, content: text, sender_type: 'user', created_at: new Date().toISOString() }, ...prev]);
            setInputText('');
            return;
        }

        if (attachmentUrl) {
            const { error: attError } = await supabase
                .from('message_attachments')
                .insert({
                    message_id: msg.id,
                    bucket: 'chat-media',
                    path: attachmentUrl,
                    mime_type: type
                });
            if (attError) console.warn('Attachment insert failed:', attError);
        }

        if (senderType === 'user') setInputText('');

        // Bot logic
        if (senderType === 'user' && text.toLowerCase().includes('help')) {
            setShowOptions(true);
        }
    }

    const handleOptionSelect = async (option: typeof BOT_OPTIONS[0]) => {
        setShowOptions(false);
        // 1. Send user selection message
        await sendMessage(option.label, 'text', undefined, 'user');

        // 2. Wait and send bot response
        setTimeout(async () => {
            const responseText = BOT_RESPONSES[option.value] || "Thank you for the selection. How else can I help you?";
            await sendMessage(responseText, 'text', undefined, 'bot');
        }, 1000);
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMe = item.sender_type === 'user';
        const isBot = item.sender_type === 'bot';

        return (
            <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.otherMsgWrapper]}>
                {!isMe && (
                    <Avatar.Icon
                        size={32}
                        icon={isBot ? "robot" : "account-tie"}
                        style={{ backgroundColor: isBot ? theme.colors.secondaryContainer : theme.colors.primaryContainer, marginRight: 8, alignSelf: 'flex-end' }}
                        color={isBot ? theme.colors.onSecondaryContainer : theme.colors.onPrimaryContainer}
                    />
                )}
                <Surface
                    style={[
                        styles.msgContainer,
                        isMe ? [styles.myMsg, { backgroundColor: theme.colors.primary }] : [styles.otherMsg, { backgroundColor: theme.colors.surfaceVariant, elevation: 1 }]
                    ]}
                >
                    {item.content ? <Text style={[styles.msgText, { color: isMe ? 'white' : theme.colors.onSurfaceVariant }]}>{item.content}</Text> : null}
                    {item.message_attachments && item.message_attachments.map((att: any) => (
                        <Image key={att.id} source={{ uri: att.path }} style={styles.msgImage} />
                    ))}
                </Surface>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => router.back()} />
                    <Text style={styles.headerTitle}>Support Chat</Text>
                </View>
            </View>

            <FlatList
                inverted
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    showOptions ? (
                        <Surface style={[styles.optionsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={2}>
                            <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: 'bold', color: theme.colors.onSurface }}>Select an option:</Text>
                            <View style={styles.chipRow}>
                                {BOT_OPTIONS.map(opt => (
                                    <Chip
                                        key={opt.value}
                                        style={styles.optionChip}
                                        onPress={() => handleOptionSelect(opt)}
                                        textStyle={{ fontSize: 13 }}
                                    >
                                        {opt.label}
                                    </Chip>
                                ))}
                            </View>
                        </Surface>
                    ) : null
                }
            />

            <Surface style={[styles.inputContainer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]} elevation={2}>
                <ChatMediaAttachment onSend={(url, type) => sendMessage('', type, url)} />
                <TextInput
                    mode="flat"
                    style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor={theme.colors.onSurface}
                />
                <IconButton
                    icon="send"
                    mode="contained"
                    containerColor={theme.colors.primary}
                    iconColor="white"
                    onPress={() => sendMessage()}
                    disabled={!inputText.trim()}
                />
            </Surface>
        </KeyboardAvoidingView>
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
    list: { padding: 16 },
    msgWrapper: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
    myMsgWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    otherMsgWrapper: { alignSelf: 'flex-start' },
    msgContainer: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
    myMsg: { borderBottomRightRadius: 2 },
    otherMsg: { borderBottomLeftRadius: 2 },
    msgText: { fontSize: 15, lineHeight: 20 },
    msgImage: { width: 220, height: 220, borderRadius: 12, marginTop: 8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderTopWidth: 1
    },
    input: { flex: 1, height: 44, borderRadius: 22, marginHorizontal: 8 },
    optionsContainer: {
        marginTop: 10,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: { marginBottom: 4 }
});

