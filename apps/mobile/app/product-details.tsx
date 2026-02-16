import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { Text, Button, Chip, IconButton, Divider, useTheme, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProductById } from '../lib/data';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params;
    const theme = useTheme();

    const product = getProductById(id as string);

    if (!product) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.onSurface }}>Product not found</Text>
                <Button onPress={() => router.push("/(tabs)/gift")}>Go Back</Button>
            </View>
        );
    }

    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [quantity, setQuantity] = useState(1);
    const [activeSlide, setActiveSlide] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = () => {
        // In a real app, this would update a cart context/database
        setShowSuccess(true);
    };

    const onScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeSlide) {
            setActiveSlide(slide);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton icon="arrow-left" iconColor={theme.colors.onSurface} onPress={() => router.push("/(tabs)/gift")} />
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Media Gallery */}
                <View style={styles.galleryContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    >
                        {product.media.map((item, index) => (
                            <View key={index} style={styles.mediaSlide}>
                                {item.type === 'image' ? (
                                    <View style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Image
                                            source={{ uri: item.url }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                ) : (
                                    <View style={[styles.videoPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <MaterialCommunityIcons name="play-circle" size={50} color={theme.colors.primary} />
                                        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Video Preview Available</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {product.media.map((_, i) => (
                            <View key={i} style={[styles.dot, i === activeSlide ? { backgroundColor: theme.colors.primary, width: 20 } : { backgroundColor: theme.colors.outlineVariant }]} />
                        ))}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>{product.title}</Text>
                        <Text variant="headlineSmall" style={[styles.price, { color: theme.colors.primary }]}>₦{product.price.toLocaleString()}</Text>
                    </View>

                    <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>{product.description}</Text>

                    <Divider style={styles.divider} />

                    {/* Variants: Colors */}
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Color</Text>
                    <View style={styles.chipRow}>
                        {product.colors.map(c => (
                            <Chip
                                key={c}
                                selected={selectedColor === c}
                                onPress={() => setSelectedColor(c)}
                                style={[styles.chip, { backgroundColor: selectedColor === c ? theme.colors.primary : theme.colors.surface }]}
                                textStyle={{ color: selectedColor === c ? 'white' : theme.colors.onSurface }}
                            >
                                {c}
                            </Chip>
                        ))}
                    </View>

                    {/* Variants: Sizes */}
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Size</Text>
                    <View style={styles.chipRow}>
                        {product.sizes.map(s => (
                            <Chip
                                key={s}
                                selected={selectedSize === s}
                                onPress={() => setSelectedSize(s)}
                                style={[styles.chip, { backgroundColor: selectedSize === s ? theme.colors.primary : theme.colors.surface }]}
                                textStyle={{ color: selectedSize === s ? 'white' : theme.colors.onSurface }}
                            >
                                {s}
                            </Chip>
                        ))}
                    </View>

                    <Divider style={styles.divider} />

                    {/* Quantity */}
                    <View style={styles.quantityRow}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Quantity</Text>
                        <View style={[styles.counter, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <IconButton icon="minus" size={20} iconColor={theme.colors.onSurface} onPress={() => setQuantity(Math.max(1, quantity - 1))} />
                            <Text variant="titleMedium" style={{ marginHorizontal: 10, color: theme.colors.onSurface }}>{quantity}</Text>
                            <IconButton icon="plus" size={20} iconColor={theme.colors.onSurface} onPress={() => setQuantity(quantity + 1)} />
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Reviews Section */}
                    <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Reviews</Text>

                    {/* Review List */}
                    <View style={styles.reviewList}>
                        {[1, 2].map((_, i) => (
                            <Surface key={i} style={[styles.reviewItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text variant="labelLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Happy Customer</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <MaterialCommunityIcons key={s} name="star" size={14} color="#F59E0B" />
                                        ))}
                                    </View>
                                </View>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                    Truly a wonderful gift! The packaging was exquisite and arrived right on time.
                                </Text>
                            </Surface>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
                {!showSuccess ? (
                    <Button
                        mode="contained"
                        onPress={handleAddToCart}
                        style={styles.addToCartBtn}
                        contentStyle={{ height: 50 }}
                    >
                        Add to Cart  ₦{(product.price * quantity).toLocaleString()}
                    </Button>
                ) : (
                    <View style={styles.successActions}>
                        <Button
                            mode="outlined"
                            onPress={() => router.replace("/(tabs)/gift")}
                            style={[styles.actionBtn, { borderColor: theme.colors.primary }]}
                            contentStyle={{ height: 44 }}
                        >
                            Continue Shopping
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => router.push("/checkout")}
                            style={styles.actionBtn}
                            contentStyle={{ height: 44 }}
                        >
                            View Cart
                        </Button>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 10, paddingBottom: 10 },

    galleryContainer: { height: 350, position: 'relative', marginTop: 10 },
    mediaSlide: { width: width, height: 350, justifyContent: 'center', alignItems: 'center' },
    imageContainer: {
        width: width - 32,
        height: 320,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    productImage: { width: '100%', height: '100%' },
    videoPlaceholder: {
        width: width - 32,
        height: 320,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    pagination: { flexDirection: 'row', position: 'absolute', bottom: 20, alignSelf: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },

    content: { padding: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { flex: 1, fontWeight: 'bold', marginRight: 10 },
    price: { fontWeight: 'bold' },
    description: { lineHeight: 20 },

    divider: { marginVertical: 20 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { borderColor: 'transparent', borderWidth: 1 },

    quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    counter: { flexDirection: 'row', alignItems: 'center', borderRadius: 30 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20,
        borderTopWidth: 1,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    addToCartBtn: { borderRadius: 12 },
    successActions: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, borderRadius: 12 },

    reviewList: { gap: 16 },
    reviewItem: { padding: 12, borderRadius: 16 }
});
