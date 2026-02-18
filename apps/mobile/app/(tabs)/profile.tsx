import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, Button, Avatar, Surface, IconButton, Divider, List, useTheme, TouchableRipple, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../lib/ThemeContext';

export default function ProfileScreen() {
    const { session, role, signOut, isAdmin } = useAuth();
    const { isDarkMode, toggleTheme } = useThemeContext();
    const theme = useTheme();
    const router = useRouter();
    const [signOutDialog, setSignOutDialog] = React.useState(false);

    const handleSignOut = async () => {
        setSignOutDialog(true);
    };

    const userEmail = session?.user?.email || 'Guest User';
    const userName = session?.user?.user_metadata?.full_name || userEmail.split('@')[0];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                    <View style={styles.headerContent}>
                        <Avatar.Text
                            size={80}
                            label={userName.substring(0, 2).toUpperCase()}
                            style={styles.avatar}
                            labelStyle={{ color: theme.colors.primary }}
                        />
                        <Text variant="headlineSmall" style={styles.userName}>{userName}</Text>
                        <Text variant="bodyMedium" style={styles.userRole}>{role?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                        <TouchableRipple onPress={() => router.push('/profile/personal-info')}>
                            <List.Item
                                title="My Personal Info"
                                titleStyle={{ color: theme.colors.onSurface }}
                                description={userEmail}
                                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                                left={props => <List.Icon {...props} icon="account-outline" color={theme.colors.primary} />}
                                right={props => <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />}
                            />
                        </TouchableRipple>
                        <Divider />
                        <List.Item
                            title="Shipping Addresses"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={props => <List.Icon {...props} icon="map-marker-outline" color="#6D28D9" />}
                            right={props => <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />}
                        />
                        <Divider />
                        <TouchableRipple onPress={() => router.push('/profile/security')}>
                            <List.Item
                                title="Security Settings"
                                titleStyle={{ color: theme.colors.onSurface }}
                                left={props => <List.Icon {...props} icon="shield-lock-outline" color="#6D28D9" />}
                                right={props => <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />}
                            />
                        </TouchableRipple>
                        <Divider />
                        <List.Item
                            title="Payment Methods"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={props => <List.Icon {...props} icon="credit-card-outline" color="#6D28D9" />}
                            right={props => <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />}
                        />
                    </Surface>

                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Preferences</Text>
                    <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                        <List.Item
                            title="Dark Mode"
                            titleStyle={{ color: theme.colors.onSurface }}
                            description="Toggle app theme"
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            left={props => <List.Icon {...props} icon={isDarkMode ? "weather-night" : "weather-sunny"} color="#6D28D9" />}
                            right={() => (
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#767577', true: '#C4B5FD' }}
                                    thumbColor={isDarkMode ? '#6D28D9' : '#f4f3f4'}
                                />
                            )}
                        />
                    </Surface>

                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Management</Text>
                    <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                        {isAdmin && (
                            <>
                                <List.Item
                                    title="Admin Dashboard"
                                    titleStyle={{ color: '#6D28D9', fontWeight: 'bold' }}
                                    left={props => <List.Icon {...props} icon="shield-check-outline" color="#6D28D9" />}
                                    onPress={() => router.push('/admin')}
                                />
                                <Divider />
                            </>
                        )}
                        <List.Item
                            title="My Orders"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={props => <List.Icon {...props} icon="package-variant-closed" color="#6D28D9" />}
                            onPress={() => router.push('/orders')}
                        />
                        <Divider />
                        <List.Item
                            title="Help & Support"
                            titleStyle={{ color: theme.colors.onSurface }}
                            left={props => <List.Icon {...props} icon="help-circle-outline" color="#6D28D9" />}
                            onPress={() => router.push('/chat')}
                        />
                    </Surface>

                    <Button
                        mode="outlined"
                        onPress={handleSignOut}
                        style={[styles.signOutBtn, { borderColor: isDarkMode ? '#450a0a' : '#FED7D7' }]}
                        textColor={isDarkMode ? '#F87171' : '#DC2626'}
                        icon="logout"
                    >
                        Sign Out
                    </Button>

                    <Text variant="bodySmall" style={styles.version}>Version 1.0.5</Text>
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={signOutDialog} onDismiss={() => setSignOutDialog(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}>
                    <Dialog.Title style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>Sign Out</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Are you sure you want to sign out?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setSignOutDialog(false)} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                        <Button onPress={async () => {
                            setSignOutDialog(false);
                            // Explicitly navigate to login to prevent layout loop/crash
                            router.replace('/auth/login');
                            // Then sign out
                            await signOut();
                        }} textColor={theme.colors.error}>Sign Out</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { alignItems: 'center' },
    avatar: { backgroundColor: 'white' },
    userName: { color: 'white', fontWeight: 'bold', marginTop: 12 },
    userRole: { color: '#E9D5FF', fontSize: 12, marginTop: 2 },
    content: { padding: 20 },
    sectionTitle: { fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
    sectionCard: { borderRadius: 16, overflow: 'hidden' },
    signOutBtn: { marginTop: 40, borderRadius: 12 },
    version: { textAlign: 'center', marginTop: 20, color: '#9CA3AF', marginBottom: 40 }
});
