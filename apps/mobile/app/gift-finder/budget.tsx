import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function GiftFinderBudget() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [budget, setBudget] = useState('50');

    const next = () => {
        router.push({ pathname: '/gift-finder/suggestions', params: { ...params, budget } });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What is your budget?</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
                placeholder="Enter amount in USD"
            />
            <Button title="Find Gifts" onPress={next} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 40 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        fontSize: 18,
        marginBottom: 20,
        borderRadius: 5
    }
});
