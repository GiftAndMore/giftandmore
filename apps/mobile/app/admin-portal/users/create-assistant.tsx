import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, Checkbox, HelperText, Portal, Dialog, Paragraph, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mockStore } from '../../../lib/mock-api';
import { AssistantTask } from '../../../lib/mock-api/types';

const TASKS: { label: string; value: AssistantTask }[] = [
    { label: 'Live Agent Support', value: 'live_agent_support' },
    { label: 'Manage Products (Edit/Delete)', value: 'manage_products' },
    { label: 'Add Products', value: 'add_products' },
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorDialog, setErrorDialog] = useState<{ visible: boolean; title: string; message: string }>({ visible: false, title: '', message: '' });
    const [showCredentials, setShowCredentials] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email?: string; password?: string }>({});

    const showError = (title: string, message: string) => {
        setErrorDialog({ visible: true, title, message });
    };

    const handleCreate = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            showError('Error', 'Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showError('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await mockStore.createAssistant({
                email,
                full_name: fullName,
                tasks: selectedTasks,
                password
            });

            setCreatedCredentials({ email, password });
            setShowCredentials(true);
        } catch (e) {
            showError('Error', 'Failed to create assistant');
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
        // For copy success, we can use a Toast or small dialog, but the user didn't ask to change this specifically yet.
        // We'll keep it simple for now or use the same error dialog for "Success" if needed, but this is a copy action.
        Alert.alert('Copied', `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconButton icon="arrow-left" size={24} onPress={() => router.back()} style={{ marginLeft: -12 }} />
                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>Create Assistant</Text>
                </View>
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
                    secureTextEntry={!showPassword}
                    right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <TextInput
                    label="Confirm Password *"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
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
                <Dialog visible={showCredentials} onDismiss={() => { setShowCredentials(false); router.back(); }} style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}>
                    <Dialog.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.dark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" />
                        </View>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', textAlign: 'center', color: theme.colors.onSurface }}>Account Created!</Text>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 8, marginBottom: 24 }}>
                            Please save these credentials securely. The password will not be shown again.
                        </Text>

                        <View style={{ width: '100%', backgroundColor: theme.colors.secondaryContainer, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.primary }}>
                            <View style={{ marginBottom: 12 }}>
                                <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer, opacity: 0.7 }}>Email Address</Text>
                                <Text variant="bodyLarge" style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }} selectable>{createdCredentials.email}</Text>
                            </View>
                            <View>
                                <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer, opacity: 0.7 }}>Password</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }} selectable>{createdCredentials.password}</Text>
                                    <IconButton
                                        icon="content-copy"
                                        iconColor={theme.colors.primary}
                                        size={20}
                                        onPress={copyToClipboard}
                                        style={{ margin: 0 }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 24 }}>
                        <Button
                            mode="contained"
                            onPress={() => { setShowCredentials(false); router.back(); }}
                            style={{ flex: 1, marginHorizontal: 16 }}
                        >
                            Done & Close
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Portal>
                <Dialog visible={errorDialog.visible} onDismiss={() => setErrorDialog({ ...errorDialog, visible: false })} style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}>
                    <Dialog.Title style={{ color: theme.colors.error, fontWeight: 'bold' }}>{errorDialog.title}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph style={{ color: theme.colors.onSurface }}>{errorDialog.message}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setErrorDialog({ ...errorDialog, visible: false })} textColor={theme.colors.primary}>OK</Button>
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
