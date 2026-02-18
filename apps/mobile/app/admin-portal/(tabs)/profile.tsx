import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Text, Button, useTheme, IconButton, Avatar, Surface, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdminAuth } from '../../../lib/admin-auth';
import { useThemeContext } from '../../../lib/ThemeContext';

export default function AdminProfileScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { adminSession, signOutAdmin } = useAdminAuth();
    const { isDarkMode, toggleTheme } = useThemeContext();
    const [signOutDialog, setSignOutDialog] = useState(false);

    // Mock admin data since auth object might be simple
    const adminName = adminSession?.user?.email?.split('@')[0] || 'Admin User';
    const adminEmail = adminSession?.user?.email || 'admin@giftandmore.com';

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header Background */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 180, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 }}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Toolbar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16 }}>
                    <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold' }}>Admin Profile</Text>
                </View>

                {/* Profile Content */}
                <View style={{ alignItems: 'center', marginTop: 30, paddingHorizontal: 20 }}>
                    {/* Avatar */}
                    <View style={{ marginBottom: 20, elevation: 4 }}>
                        <View style={{ padding: 4, backgroundColor: theme.colors.surface, borderRadius: 70 }}>
                            <Avatar.Text size={100} label="AD" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
                        </View>
                    </View>

                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>{adminName}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginBottom: 20 }}>{adminEmail}</Text>

                    {/* Preferences */}
                    <Surface style={{ width: '100%', padding: 24, borderRadius: 24, backgroundColor: theme.colors.surface, elevation: 2, marginTop: 10 }}>
                        <Text variant="titleMedium" style={{ marginBottom: 20, fontWeight: 'bold' }}>Preferences</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <IconButton icon={isDarkMode ? "weather-night" : "weather-sunny"} size={24} iconColor={theme.colors.primary} style={{ margin: 0, marginRight: 8 }} />
                                <View>
                                    <Text variant="bodyLarge">Dark Mode</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Toggle app theme</Text>
                                </View>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#767577', true: theme.colors.primaryContainer }}
                                thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
                            />
                        </View>
                    </Surface>

                    {/* Actions */}
                    <TouchableOpacity onPress={() => setSignOutDialog(true)} style={{ marginTop: 32, flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                        <Text style={{ color: theme.colors.error, fontWeight: 'bold', fontSize: 16 }}>Sign Out</Text>
                    </TouchableOpacity>

                    <Text style={{ marginTop: 20, color: theme.colors.outline, fontSize: 12 }}>Admin Portal v1.0.0</Text>
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={signOutDialog} onDismiss={() => setSignOutDialog(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}>
                    <Dialog.Title style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>Sign Out</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Are you sure you want to sign out from Admin Portal?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setSignOutDialog(false)} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                        <Button onPress={async () => {
                            setSignOutDialog(false);
                            await signOutAdmin();
                            router.replace('/auth/login');
                        }} textColor={theme.colors.error}>Sign Out</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}
