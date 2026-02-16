import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, Checkbox, HelperText, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore } from '../../../lib/mock-api';
import { AssistantTask } from '../../../lib/mock-api/types';

const TASKS: { label: string; value: AssistantTask }[] = [
    { label: 'Live Agent Support', value: 'live_agent_support' },
    { label: 'Manage Products', value: 'manage_products' },
    { label: 'Update Orders', value: 'update_orders' },
    { label: 'Manage Banners', value: 'manage_banners' },
    { label: 'Manage Custom Requests', value: 'manage_custom_requests' },
];

export default function CreateAssistantScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedTasks, setSelectedTasks] = useState<AssistantTask[]>(['live_agent_support']);
    const [showCredentials, setShowCredentials] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ email: '', password: '' });

    const handleCreate = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await mockStore.createAssistant({
                email,
                full_name: fullName,
                tasks: selectedTasks
            });

            setCreatedCredentials({ email, password });
            setShowCredentials(true);
        } catch (e) {
            Alert.alert('Error', 'Failed to create assistant');
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (task: AssistantTask) => {
        if (selectedTasks.includes(task)) {
            setSelectedTasks(prev => prev.filter(t => t !== task));
        } else {
            setSelectedTasks(prev => [...prev, task]);
        }
    };

    const copyToClipboard = () => {
        // In a real app, implement Clipboard.setString
        Alert.alert('Copied', `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>Create Assistant</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Create a new account for support staff or managers.
                </Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    label="Full Name *"
                    value={fullName}
                    onChangeText={setFullName}
                    mode="outlined"
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <TextInput
                    label="Email Address *"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <TextInput
                    label="Password *"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <TextInput
                    label="Confirm Password *"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold', color: theme.colors.onSurface }}>
                    Permissions & Tasks
                </Text>

                <View style={[styles.tasksContainer, { backgroundColor: theme.colors.surface }]}>
                    {TASKS.map((task) => (
                        <View key={task.value} style={styles.taskItem}>
                            <Checkbox
                                status={selectedTasks.includes(task.value) ? 'checked' : 'unchecked'}
                                onPress={() => toggleTask(task.value)}
                            />
                            <Text onPress={() => toggleTask(task.value)} style={{ color: theme.colors.onSurface }}>{task.label}</Text>
                        </View>
                    ))}
                </View>

                <Button
                    mode="contained"
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.button}
                    contentStyle={{ height: 50 }}
                >
                    Create Account
                </Button>
            </View>

            <Portal>
                <Dialog visible={showCredentials} onDismiss={() => { setShowCredentials(false); router.back(); }} style={{ backgroundColor: theme.colors.surface }}>
                    <Dialog.Title style={{ color: theme.colors.onSurface }}>Account Created</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                            Please share these credentials with the assistant immediately. The password will not be shown again.
                        </Paragraph>
                        <View style={[styles.credentialsBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSecondaryContainer }}>Email: {createdCredentials.email}</Text>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 8, color: theme.colors.primary }}>Password: {createdCredentials.password}</Text>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={copyToClipboard}>Copy</Button>
                        <Button onPress={() => { setShowCredentials(false); router.back(); }}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 20 },
    form: { padding: 20, paddingTop: 0 },
    input: { marginBottom: 16 },
    tasksContainer: { borderRadius: 8, padding: 8, marginBottom: 24, borderWidth: 1, borderColor: '#e0e0e0' },
    taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    button: { marginTop: 8, borderRadius: 8 },
    credentialsBox: { padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' }
});
