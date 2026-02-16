import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function GiftFinderSex() {
    const router = useRouter();

    const selectSex = (sex: string) => {
        // Save to context/store (TODO)
        router.push({ pathname: '/gift-finder/purpose', params: { sex } });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Who is this gift for?</Text>
            <View style={styles.buttonContainer}>
                <Button title="Male" onPress={() => selectSex('Male')} />
                <View style={styles.spacer} />
                <Button title="Female" onPress={() => selectSex('Female')} />
                <View style={styles.spacer} />
                <Button title="Other" onPress={() => selectSex('Other')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 40 },
    buttonContainer: { gap: 10 },
    spacer: { height: 10 }
});
