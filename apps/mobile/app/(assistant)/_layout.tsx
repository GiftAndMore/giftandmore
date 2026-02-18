import { Slot, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../lib/auth';
import { Text, Button } from 'react-native-paper';

export default function AssistantLayout() {
    const { session, loading, role } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/auth/login" />;
    }

    if (role !== 'assistant') {
        // Redirect to appropriate portal based on role
        if (role === 'admin') {
            return <Redirect href="/admin-portal/(tabs)" />;
        }
        // Default to user tabs
        return <Redirect href="/(tabs)" />;
    }

    return <Slot />;
}
