import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { Text, Button, RadioButton, Surface, Divider, IconButton, Appbar, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../lib/auth';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default function PaymentScreen() {
    const router = useRouter();
    const { orderId, amount } = useLocalSearchParams();
    const theme = useTheme();
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    async function handlePayment() {
        setLoading(true);
        try {
            // 1. Create Payment Intent
            const { data: intent, error } = await supabase.functions.invoke('create_payment_intent', {
                body: { order_id: orderId, amount: Number(amount), provider: 'mock' },
                headers: { Authorization: `Bearer ${(session as any)?.access_token}` }
            });

            if (error) throw error;

            // 2. Simulate Provider SDK Flow (Wait 2 secs)
            setTimeout(async () => {
                // 3. Trigger Webhook (Mock)
                await supabase.functions.invoke('payment_webhook', {
                    body: { paymentId: intent.paymentId, status: 'succeeded' }
                });

                setLoading(false);
                Alert.alert("Success", "Payment confirmed!", [
                    { text: "Track Order", onPress: () => router.replace(`/orders/${orderId}`) }
                ]);
            }, 2000);

        } catch (e: any) {
            Alert.alert("Error", e.message);
            setLoading(false);
        }
    }

    const isDark = theme.dark;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Button icon="arrow-left" textColor="white" onPress={() => router.back()} style={{ minWidth: 0, padding: 0, margin: 0 }}>{''}</Button>
                    <Text variant="headlineSmall" style={{ color: 'white', fontWeight: 'bold' }}>Payment</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Order Summary */}
                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Total Amount</Text>
                    <Text variant="displayMedium" style={{ fontWeight: 'bold', color: theme.colors.primary, marginVertical: 10 }}>
                        ₦{Number(amount).toLocaleString()}
                    </Text>
                    <Divider style={{ backgroundColor: theme.colors.outlineVariant, width: '100%', marginVertical: 10 }} />
                    <View style={styles.row}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Order ID</Text>
                        <Text style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>#{String(orderId).slice(0, 8)}</Text>
                    </View>
                </Surface>

                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Select Payment Method</Text>

                <RadioButton.Group onValueChange={newValue => setPaymentMethod(newValue)} value={paymentMethod}>
                    <Surface style={[styles.methodCard, paymentMethod === 'card' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }, { backgroundColor: paymentMethod === 'card' ? theme.colors.primaryContainer : theme.colors.surface }]} elevation={1}>
                        <View style={styles.methodRow}>
                            <RadioButton value="card" color={theme.colors.primary} />
                            <IconButton icon="credit-card-outline" size={24} iconColor={theme.colors.onSurface} />
                            <View>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Pay with Card</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Visa, Mastercard, Verve</Text>
                            </View>
                        </View>
                    </Surface>

                    <Surface style={[styles.methodCard, paymentMethod === 'transfer' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }, { backgroundColor: paymentMethod === 'transfer' ? theme.colors.primaryContainer : theme.colors.surface }]} elevation={1}>
                        <View style={styles.methodRow}>
                            <RadioButton value="transfer" color={theme.colors.primary} />
                            <IconButton icon="bank-outline" size={24} iconColor={theme.colors.onSurface} />
                            <View>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Bank Transfer</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Transfer to generated account</Text>
                            </View>
                        </View>
                    </Surface>

                    <Surface style={[styles.methodCard, paymentMethod === 'ussd' && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }, { backgroundColor: paymentMethod === 'ussd' ? theme.colors.primaryContainer : theme.colors.surface }]} elevation={1}>
                        <View style={styles.methodRow}>
                            <RadioButton value="ussd" color={theme.colors.primary} />
                            <IconButton icon="cellphone" size={24} iconColor={theme.colors.onSurface} />
                            <View>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>USSD</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>*737#, *901#, etc.</Text>
                            </View>
                        </View>
                    </Surface>
                </RadioButton.Group>

                <Button
                    mode="contained"
                    onPress={handlePayment}
                    loading={loading}
                    disabled={loading}
                    style={[styles.payButton, { backgroundColor: theme.colors.primary }]}
                    contentStyle={{ height: 56 }}
                >
                    Pay ₦{Number(amount).toLocaleString()}
                </Button>

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text variant="bodySmall" style={{ color: '#999' }}>Secured by Flutterwave / Paystack</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingHorizontal: 8,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4
    },
    content: { padding: 20 },
    card: { padding: 20, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 12 },

    methodCard: { borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent' },
    selectedMethod: { borderColor: '#6D28D9', backgroundColor: '#F3E8FF' }, // Fallback styles, overridden inline
    methodRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },

    payButton: { marginTop: 20, borderRadius: 12 }
});
