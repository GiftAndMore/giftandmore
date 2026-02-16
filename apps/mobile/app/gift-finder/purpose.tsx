import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function GiftFinderPurpose() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const selectPurpose = (purpose: string) => {
        router.push({ pathname: '/gift-finder/budget', params: { ...params, purpose } });
    };

    const purposes = ['Birthday', 'Valentine', 'Office Guest', 'Random Gift', 'Other'];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What's the occasion?</Text>
            <View style={styles.buttonContainer}>
                {purposes.map((p) => (
                    <View key={p} style={styles.spacer}>
                        <Button title={p} onPress={() => selectPurpose(p)} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 40 },
    buttonContainer: { gap: 10 },
    spacer: { marginBottom: 10 }
});
