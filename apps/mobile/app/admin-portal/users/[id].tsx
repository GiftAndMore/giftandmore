import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, useTheme, Avatar, Chip, Switch, Divider, IconButton, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockStore, User } from '../../../lib/mock-api';
import { AssistantTask } from '../../../lib/mock-api/types';

export default function UserDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [resetCredential, setResetCredential] = useState<string | null>(null);

    useEffect(() => {
        loadUser();
    }, [id]);

    const loadUser = async () => {
        setLoading(true);
        const data = await mockStore.getUser(id as string);
        if (data) {
            setUser(data);
        } else {
            Alert.alert('Error', 'User not found');
            router.back();
        }
        setLoading(false);
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        setActionLoading(true);
        try {
            await mockStore.toggleAssistantStatus(user.id, !user.assistant_enabled);
            setUser({ ...user, assistant_enabled: !user.assistant_enabled });
        } catch (e) {
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = () => {
        Alert.alert(
            'Reset Password',
            `Are you sure you want to reset the password for ${user?.full_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const newPass = await mockStore.resetPassword(user!.id);
                            setResetCredential(newPass);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to reset password');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Account',
            `Are you sure you want to delete ${user?.full_name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await mockStore.deleteUser(user!.id);
                            router.back();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete user');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
    }

    if (!user) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>User Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Avatar.Text size={80} label={user.full_name.substring(0, 2).toUpperCase()} style={{ backgroundColor: user.role === 'admin' ? '#3B82F6' : user.role === 'assistant' ? '#8B5CF6' : '#E5E7EB' }} />
                <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: 'bold' }}>{user.full_name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{user.email}</Text>
                <Chip style={{ marginTop: 12 }}>{user.role.toUpperCase()}</Chip>
            </View>

            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={styles.row}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>User ID</Text>
                    <Text variant="bodyMedium">{user.id}</Text>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Created</Text>
                    <Text variant="bodyMedium">{new Date(user.created_at).toLocaleDateString()}</Text>
                </View>
                <Divider />
                <View style={styles.row}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Status</Text>
                    <Text variant="bodyMedium" style={{ color: user.is_banned ? theme.colors.error : theme.colors.primary }}>{user.is_banned ? 'Banned' : 'Active'}</Text>
                </View>
            </Surface>

            {user.role === 'assistant' && (
                <>
                    <Text variant="titleMedium" style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 8, fontWeight: 'bold' }}>Assistant Settings</Text>
                    <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Account Enabled</Text>
                            <Switch value={user.assistant_enabled ?? true} onValueChange={handleToggleStatus} disabled={actionLoading} />
                        </View>
                        <Divider />
                        <View style={{ padding: 16 }}>
                            <Text variant="bodyMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>Assigned Tasks</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {user.assistant_tasks?.map((task: AssistantTask) => (
                                    <Chip key={task} style={{ backgroundColor: theme.colors.secondaryContainer }}>
                                        {task.replace(/_/g, ' ')}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                        <Divider />
                        <Button mode="text" onPress={handleResetPassword} loading={actionLoading} textColor={theme.colors.primary}>
                            Reset Password
                        </Button>
                    </Surface>
                </>
            )}

            <View style={{ padding: 20 }}>
                <Button
                    mode="contained"
                    buttonColor={theme.colors.error}
                    onPress={handleDelete}
                    loading={actionLoading}
                    icon="delete"
                >
                    Delete Account
                </Button>
            </View>

            <Portal>
                <Dialog visible={!!resetCredential} onDismiss={() => setResetCredential(null)} style={{ backgroundColor: theme.colors.surface }}>
                    <Dialog.Title>Password Reset</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>The new password for {user.full_name} is:</Paragraph>
                        <Text variant="headlineMedium" style={{ textAlign: 'center', marginVertical: 16, fontWeight: 'bold', color: theme.colors.primary }}>
                            {resetCredential}
                        </Text>
                        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>Please share this with the user immediately.</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setResetCredential(null)}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingTop: 40 },
    section: { marginHorizontal: 20, borderRadius: 12, overflow: 'hidden' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }
});
