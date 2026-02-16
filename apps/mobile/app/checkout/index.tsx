import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Button, Surface, IconButton, Divider, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CheckoutScreen() {
    const router = useRouter();
    const theme = useTheme();

    const [cartItems, setCartItems] = useState([
        {
            id: '1',
            title: "Luxury Flower Box",
            price: 35000,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1522673607200-1648832cee48?q=80&w=400"
        },
        {
            id: '2',
            title: "Teddy Bear",
            price: 12000,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=400"
        }
    ]);

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => router.navigate('/(tabs)/gift')} />
                    <Text variant="headlineSmall" style={[styles.headerTitle, { color: 'white' }]}>My Cart</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {cartItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="cart-off" size={80} color={theme.colors.surfaceVariant} />
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>Your cart is empty</Text>
                        <Button mode="contained" onPress={() => router.navigate('/(tabs)/gift')} style={{ marginTop: 20, borderRadius: 12, backgroundColor: theme.colors.primary }}>
                            Go Shopping
                        </Button>
                    </View>
                ) : (
                    <>
                        {cartItems.map(item => (
                            <Surface key={item.id} style={[styles.cartItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={1}>
                                <View style={styles.itemInner}>
                                    <View style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.itemImage}
                                            resizeMode="cover"
                                        />
                                    </View>

                                    <View style={styles.itemDetails}>
                                        <View style={styles.detailsTop}>
                                            <View style={{ flex: 1 }}>
                                                <Text variant="titleMedium" numberOfLines={1} style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
                                                <Text variant="titleSmall" style={[styles.itemPrice, { color: theme.colors.primary }]}>₦{item.price.toLocaleString()}</Text>
                                            </View>
                                            <IconButton
                                                icon="trash-can-outline"
                                                iconColor="#EF4444"
                                                size={22}
                                                onPress={() => removeItem(item.id)}
                                                style={{ margin: 0, paddingRight: 0 }}
                                            />
                                        </View>

                                        <View style={styles.controlsRow}>
                                            <View style={[styles.quantityContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                                <IconButton
                                                    icon="minus"
                                                    size={16}
                                                    iconColor={theme.colors.onSurface}
                                                    onPress={() => updateQuantity(item.id, -1)}
                                                    style={styles.qtyBtn}
                                                />
                                                <Text variant="titleMedium" style={[styles.qtyText, { color: theme.colors.onSurface }]}>{item.quantity}</Text>
                                                <IconButton
                                                    icon="plus"
                                                    size={16}
                                                    iconColor={theme.colors.onSurface}
                                                    onPress={() => updateQuantity(item.id, 1)}
                                                    style={styles.qtyBtn}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Surface>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
                <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
                    <View style={styles.summaryRow}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>₦{totalAmount.toLocaleString()}</Text>
                    </View>

                    <Divider style={{ marginVertical: 12, backgroundColor: theme.colors.outlineVariant }} />

                    <View style={styles.summaryRow}>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Total</Text>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>₦{totalAmount.toLocaleString()}</Text>
                    </View>

                    <Button
                        mode="contained"
                        style={[styles.checkoutBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                        onPress={() => router.push({ pathname: "/checkout/send-gift", params: { productId: cartItems[0].id } })}
                    >
                        Proceed to Checkout
                    </Button>
                </View>
            )}
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
    },
    headerTitle: { fontWeight: 'bold' },
    cartItem: {
        marginBottom: 16,
        borderRadius: 50,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    itemInner: { flexDirection: 'row', alignItems: 'center' },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        overflow: 'hidden',
    },
    itemImage: { width: '100%', height: '100%' },
    itemDetails: { flex: 1, marginLeft: 16, justifyContent: 'center' },
    detailsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemTitle: { fontWeight: '700' },
    itemPrice: { fontWeight: 'bold', marginTop: 2 },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 6
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 4
    },
    qtyBtn: { margin: 0 },
    qtyText: { fontWeight: 'bold', paddingHorizontal: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    footer: {
        padding: 24,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    checkoutBtn: { marginTop: 16, borderRadius: 12 }
});
