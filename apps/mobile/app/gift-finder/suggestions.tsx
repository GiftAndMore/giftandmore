import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTheme } from 'react-native-paper';

// TODO: centralized client
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default function Suggestions() {
    const router = useRouter();
    const theme = useTheme();
    const { sex, purpose, budget } = useLocalSearchParams();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    async function fetchSuggestions() {
        // Basic query logic
        const { data } = await supabase
            .from('products')
            .select('*')
            .lte('price', Number(budget) || 1000)
            // .eq('is_active', true) // Assuming field exists
            .limit(10);

        // In real app, we would filter by strict tags (sex/purpose) using join or array contains
        if (data) setProducts(data);
        else {
            // Mock data if no DB connection yet
            setProducts([
                { id: '1', name: 'Cool Gadget', price: 45, image_urls: ['https://via.placeholder.com/150'] },
                { id: '2', name: 'Nice Scarf', price: 30, image_urls: ['https://via.placeholder.com/150'] },
            ])
        }
    }

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.info}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.name}</Text>
                <Text style={styles.price}>${item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>We found these for you!</Text>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontSize: 20, marginBottom: 10, textAlign: 'center' },
    card: { flex: 1, margin: 5, borderRadius: 8, padding: 10 },
    image: { width: '100%', height: 120, resizeMode: 'cover', borderRadius: 4 },
    info: { marginTop: 5 },
    name: { fontSize: 16, fontWeight: 'bold' },
    price: { fontSize: 14, color: '#888' }
});
