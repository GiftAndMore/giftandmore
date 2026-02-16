import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    async function fetchProduct() {
        // Mock fetch
        // const { data } = await supabase.from('products').select('*').eq('id', id).single();
        // setProduct(data);
        setProduct({
            id,
            name: 'Cool Gadget',
            description: 'A very cool gadget for everyone.',
            price: 45,
            image_urls: ['https://via.placeholder.com/300']
        });
    }

    if (!product) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Image source={{ uri: product.image_urls?.[0] }} style={styles.image} />
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>${product.price}</Text>
            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.action}>
                <Button title="Send as Gift" onPress={() => router.push({ pathname: '/checkout/send-gift', params: { productId: product.id } })} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 20 },
    name: { fontSize: 24, fontWeight: 'bold' },
    price: { fontSize: 20, color: '#007AFF', marginVertical: 10 },
    description: { fontSize: 16, lineHeight: 24, color: '#444' },
    action: { marginTop: 30 }
});
