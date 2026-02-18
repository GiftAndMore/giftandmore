import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, useTheme, Avatar, Chip, Switch, Divider, IconButton, Portal, Dialog } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockStore, User, AssistantActivityLog } from '../../../lib/mock-api';
import { AssistantTask } from '../../../lib/mock-api/types';

const timeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const getActivityIcon = (action: string): string => {
    if (action.toLowerCase().includes('chat') || action.toLowerCase().includes('replied')) return 'chat-outline';
    if (action.toLowerCase().includes('order')) return 'package-variant';
    if (action.toLowerCase().includes('product') || action.toLowerCase().includes('added')) return 'shopping-outline';
    if (action.toLowerCase().includes('banner')) return 'view-carousel-outline';
    if (action.toLowerCase().includes('request') || action.toLowerCase().includes('reviewed')) return 'creation-outline';
    if (action.toLowerCase().includes('login') || action.toLowerCase().includes('logged')) return 'login';
    return 'clock-outline';
};

const ALL_TASKS: AssistantTask[] = ['live_agent_support', 'manage_products', 'add_products', 'update_orders', 'manage_banners', 'manage_custom_requests'];

export default function UserDetailScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [resetCredential, setResetCredential] = useState<string | null>(null);

    // Themed dialog states
    const [feedbackDialog, setFeedbackDialog] = useState({ visible: false, title: '', message: '', isError: false });
    const [confirmDialog, setConfirmDialog] = useState<{ visible: boolean; title: string; message: string; confirmLabel: string; onConfirm: () => void }>({
        visible: false, title: '', message: '', confirmLabel: '', onConfirm: () => { }
    });

    useEffect(() => {
        loadUser();
    }, [id]);

    const loadUser = async () => {
        setLoading(true);
        const data = await mockStore.getUser(id as string);
        if (data) {
            setUser(data);
        } else {
            setFeedbackDialog({ visible: true, title: 'Error', message: 'User not found', isError: true });
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
            setFeedbackDialog({ visible: true, title: 'Error', message: 'Failed to update status', isError: true });
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleTask = async (task: AssistantTask) => {
        if (!user) return;
        const currentTasks = user.assistant_tasks || [];
        const newTasks = currentTasks.includes(task)
            ? currentTasks.filter(t => t !== task)
            : [...currentTasks, task];

        setActionLoading(true);
        try {
            const updated = await mockStore.updateUser(user.id, { assistant_tasks: newTasks });
            if (updated) setUser(updated);
        } catch (e) {
            setFeedbackDialog({ visible: true, title: 'Error', message: 'Failed to update permissions', isError: true });
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = () => {
        setConfirmDialog({
            visible: true,
            title: 'Reset Password',
            message: `Are you sure you want to reset the password for ${user?.full_name || 'this user'}?`,
            confirmLabel: 'Reset',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, visible: false }));
                setActionLoading(true);
                try {
                    const newPass = await mockStore.resetPassword(user!.id);
                    setResetCredential(newPass);
                } catch (e) {
                    setFeedbackDialog({ visible: true, title: 'Error', message: 'Failed to reset password', isError: true });
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleDelete = () => {
        setConfirmDialog({
            visible: true,
            title: 'Delete Account',
            message: `Are you sure you want to delete ${user?.full_name || 'this user'}? This action cannot be undone.`,
            confirmLabel: 'Delete',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, visible: false }));
                setActionLoading(true);
                try {
                    await mockStore.deleteUser(user!.id);
                    router.back();
                } catch (e) {
                    setFeedbackDialog({ visible: true, title: 'Error', message: 'Failed to delete user', isError: true });
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
    }

    if (!user) return null;

    const dialogStyle = { backgroundColor: theme.colors.surface, borderRadius: 20 };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" onPress={() => router.back()} />
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>User Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <View>
                        <Avatar.Text size={80} label={(user.full_name || '?').substring(0, 2).toUpperCase()} style={{ backgroundColor: user.role === 'admin' ? '#3B82F6' : user.role === 'assistant' ? '#8B5CF6' : '#E5E7EB' }} />
                        {user.role === 'assistant' && (
                            <View style={{ position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: user.assistant_status === 'online' ? '#22C55E' : '#6B7280', borderWidth: 3, borderColor: theme.colors.background }} />
                        )}
                    </View>
                    <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: 'bold' }}>{user.full_name || 'Unknown User'}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{user.email}</Text>
                    {user.role === 'assistant' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user.assistant_status === 'online' ? '#22C55E' : '#6B7280' }} />
                            <Text variant="bodySmall" style={{ color: user.assistant_status === 'online' ? '#22C55E' : '#9CA3AF' }}>
                                {user.assistant_status === 'online' ? 'Online now' : `Last seen ${timeAgo(user.last_active)}`}
                            </Text>
                        </View>
                    )}
                    <Chip style={{ marginTop: 8 }}>{user.role.toUpperCase()}</Chip>
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
                    {user.role === 'assistant' && (
                        <>
                            <Divider />
                            <View style={styles.row}>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Last Active</Text>
                                <Text variant="bodyMedium">{user.last_active ? timeAgo(user.last_active) : 'Never'}</Text>
                            </View>
                        </>
                    )}
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
                                <Text variant="bodyMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>Permissions</Text>
                                <View style={{ gap: 8 }}>
                                    {ALL_TASKS.map((task) => {
                                        const isEnabled = user.assistant_tasks?.includes(task);
                                        return (
                                            <View key={task} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text variant="bodyMedium">{task.replace(/_/g, ' ')}</Text>
                                                <Switch
                                                    value={isEnabled}
                                                    onValueChange={() => handleToggleTask(task)}
                                                    disabled={actionLoading}
                                                />
                                            </View>
                                        );
                                    })}
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

                {/* Recent Activity (24h) */}
                {user.role === 'assistant' && (user.activity_log || []).length > 0 && (
                    <>
                        <Text variant="titleMedium" style={{ marginHorizontal: 20, marginTop: 4, marginBottom: 8, fontWeight: 'bold' }}>Recent Activity (24h)</Text>
                        <Surface style={[styles.section, { backgroundColor: theme.colors.surface, marginBottom: 20 }]} elevation={1}>
                            {(user.activity_log || []).filter(log => {
                                const diff = Date.now() - new Date(log.timestamp).getTime();
                                return diff < 24 * 3600 * 1000;
                            }).map((log, idx) => (
                                <View key={log.id}>
                                    {idx > 0 && <Divider />}
                                    <View style={{ padding: 14 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <MaterialCommunityIcons
                                                name={getActivityIcon(log.action)}
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{log.action}</Text>
                                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{log.details}</Text>
                                            </View>
                                            <Text variant="bodySmall" style={{ color: theme.colors.outline, fontSize: 11 }}>{timeAgo(log.timestamp)}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Surface>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Confirmation Dialog (Delete / Reset Password) */}
            <Portal>
                <Dialog visible={confirmDialog.visible} onDismiss={() => setConfirmDialog(prev => ({ ...prev, visible: false }))} style={dialogStyle}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={48}
                            color={confirmDialog.confirmLabel === 'Delete' ? theme.colors.error : '#F59E0B'}
                        />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
                        {confirmDialog.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, fontSize: 15 }}>
                            {confirmDialog.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16, gap: 12 }}>
                        <Button
                            mode="outlined"
                            onPress={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
                            style={{ borderRadius: 20, borderColor: theme.colors.outline }}
                            textColor={theme.colors.onSurface}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={confirmDialog.onConfirm}
                            style={{ borderRadius: 20 }}
                            buttonColor={confirmDialog.confirmLabel === 'Delete' ? theme.colors.error : theme.colors.primary}
                        >
                            {confirmDialog.confirmLabel}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Feedback Dialog (Success / Error) */}
            <Portal>
                <Dialog visible={feedbackDialog.visible} onDismiss={() => setFeedbackDialog(prev => ({ ...prev, visible: false }))} style={dialogStyle}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons
                            name={feedbackDialog.isError ? 'alert-circle' : 'check-circle'}
                            size={48}
                            color={feedbackDialog.isError ? theme.colors.error : theme.colors.primary}
                        />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
                        {feedbackDialog.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, fontSize: 15 }}>
                            {feedbackDialog.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        <Button
                            mode="contained"
                            onPress={() => {
                                setFeedbackDialog(prev => ({ ...prev, visible: false }));
                                if (feedbackDialog.title === 'Error' && feedbackDialog.message === 'User not found') {
                                    router.back();
                                }
                            }}
                            style={{ borderRadius: 20, paddingHorizontal: 20 }}
                            buttonColor={theme.colors.primary}
                        >
                            OK
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Password Reset Credential Dialog */}
            <Portal>
                <Dialog visible={!!resetCredential} onDismiss={() => setResetCredential(null)} style={dialogStyle}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons name="lock-reset" size={48} color={theme.colors.primary} />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
                        Password Reset
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            The new password for {user.full_name || 'this user'} is:
                        </Text>
                        <Text variant="headlineMedium" style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary }}>
                            {resetCredential}
                        </Text>
                        <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.outline, marginTop: 12 }}>
                            Please share this with the user immediately.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        <Button
                            mode="contained"
                            onPress={() => setResetCredential(null)}
                            style={{ borderRadius: 20, paddingHorizontal: 20 }}
                            buttonColor={theme.colors.primary}
                        >
                            Done
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingTop: 40 },
    section: { marginHorizontal: 20, borderRadius: 12, overflow: 'hidden' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }
});
