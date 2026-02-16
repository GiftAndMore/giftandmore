import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PackageDetails() {
    const { id, title } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title || 'Gift Package'}</Text>
            <Text>Details for package ID: {id}</Text>
            {/* Placeholder for package details implementation */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 }
});
