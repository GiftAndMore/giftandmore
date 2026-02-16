import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockStore, CustomRequest } from '../../../lib/mock-api';

export default function RequestDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [req, setReq] = useState<CustomRequest | null>(null);

    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteMessage, setQuoteMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        const requests = await mockStore.getRequests();
        const found = requests.find(r => r.id === id);
        if (found) {
            setReq(found);
            if (found.quote_amount) setQuoteAmount(found.quote_amount.toString());
            if (found.quote_message) setQuoteMessage(found.quote_message);
        } else {
            Alert.alert('Error', 'Request not found');
            router.back();
        }
        setLoading(false);
    };

    const handleSendQuote = async () => {
        if (!quoteAmount || !quoteMessage) {
            Alert.alert('Error', 'Amount and Message are required');
            return;
        }
        setSending(true);
        try {
            await mockStore.updateRequestStatus(req!.id, 'quoted', {
                amount: parseFloat(quoteAmount),
                message: quoteMessage
            });
            Alert.alert('Success', 'Quote sent successfully');
            loadRequest(); // Reload to show updated status
        } catch (e) {
            Alert.alert('Error', 'Failed to send quote');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
    if (!req) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Request Details</Text>
            </View>

            <View style={{ padding: 20 }}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{req.purpose}</Text>
                        <Text variant="bodyMedium" style={{ marginTop: 8 }}>{req.description}</Text>

                        <View style={styles.divider} />

                        <Text variant="bodyMedium"><Text style={{ fontWeight: 'bold' }}>User:</Text> {req.user_name}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: 'bold' }}>Budget:</Text> {req.budget}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: 'bold' }}>Recipient:</Text> {req.recipient_details}</Text>
                        <Text variant="bodyMedium"><Text style={{ fontWeight: 'bold' }}>Status:</Text> {req.status}</Text>
                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>Submitted: {new Date(req.created_at).toLocaleString()}</Text>
                    </Card.Content>
                </Card>

                {req.status !== 'paid' && req.status !== 'closed' && (
                    <Card style={[styles.card, { marginTop: 20 }]}>
                        <Card.Title title="Send Quote" />
                        <Card.Content>
                            <TextInput
                                label="Quote Amount (₦)"
                                value={quoteAmount}
                                onChangeText={setQuoteAmount}
                                keyboardType="numeric"
                                mode="outlined"
                                style={styles.input}
                                disabled={req.status === 'quoted'}
                            />
                            <TextInput
                                label="Message"
                                value={quoteMessage}
                                onChangeText={setQuoteMessage}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={styles.input}
                                disabled={req.status === 'quoted'}
                            />
                            {req.status !== 'quoted' && (
                                <Button mode="contained" onPress={handleSendQuote} loading={sending} style={{ marginTop: 10 }}>
                                    Send Quote
                                </Button>
                            )}
                            {req.status === 'quoted' && <Text style={{ color: theme.colors.primary, marginTop: 10 }}>Quote already sent.</Text>}
                        </Card.Content>
                    </Card>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 40 },
    card: { marginBottom: 16, borderRadius: 12 },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
    input: { marginBottom: 12 },
});
