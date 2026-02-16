import { View, StyleSheet } from 'react-native';
import { Text, List, useTheme, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function AdminMoreScreen() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>More Tools</Text>
            </View>

            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                {/* These routes would be implemented in a full version */}
                <List.Item
                    title="Manage Custom Requests"
                    description="View quotes and paid requests"
                    left={props => <List.Icon {...props} icon="creation" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => console.log('Navigate to requests')}
                />
                <List.Item
                    title="Manage Banners"
                    description="Update home screen promotions"
                    left={props => <List.Icon {...props} icon="image-edit" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => console.log('Navigate to banners')}
                />
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 10 },
    card: { margin: 16, borderRadius: 12, overflow: 'hidden' }
});
