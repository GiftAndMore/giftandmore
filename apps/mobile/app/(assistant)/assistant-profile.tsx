import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, Avatar, Surface, ActivityIndicator, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../lib/auth';
import { mockStore } from '../../lib/mock-api';
import { User } from '../../lib/mock-api/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../lib/ThemeContext';

export default function ProfileScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { isDarkMode, toggleTheme } = useThemeContext();
    const { session, signOut } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [signOutDialog, setSignOutDialog] = useState({ visible: false });

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        const userData = await mockStore.getUser(session.user.id);
        if (userData) {
            setUser(userData);
            setFullName(userData.full_name);
            setEmail(userData.email);
            setAvatar(userData.avatar || '');
        }
        setLoading(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await mockStore.updateUser(user.id, {
                full_name: fullName,
                avatar: avatar
            });

            Alert.alert('Success', 'Profile updated successfully');
        } catch (e) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };



    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header Background */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 200, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Toolbar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16 }}>
                        <IconButton icon="arrow-left" iconColor="#fff" onPress={() => router.back()} />
                        <Text variant="headlineSmall" style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>My Profile</Text>
                    </View>

                    {/* Profile Content */}
                    <View style={{ alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
                        {/* Avatar */}
                        <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                            <View style={{ padding: 4, backgroundColor: theme.colors.surface, borderRadius: 70 }}>
                                {avatar ? (
                                    <Avatar.Image size={130} source={{ uri: avatar }} />
                                ) : (
                                    <Avatar.Text size={130} label={fullName.substring(0, 2).toUpperCase()} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
                                )}
                            </View>
                            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, borderRadius: 20, padding: 8, borderWidth: 3, borderColor: theme.colors.surface }}>
                                <IconButton icon="camera" iconColor="#fff" size={20} style={{ margin: 0 }} />
                            </View>
                        </TouchableOpacity>

                        {/* Form */}
                        <Surface style={{ width: '100%', padding: 24, borderRadius: 24, backgroundColor: theme.colors.surface, elevation: 2, marginTop: 10 }}>
                            <Text variant="titleMedium" style={{ marginBottom: 20, fontWeight: 'bold' }}>Personal Information</Text>

                            <TextInput
                                label="Full Name"
                                value={fullName}
                                onChangeText={setFullName}
                                mode="outlined"
                                style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
                                left={<TextInput.Icon icon="account" color={theme.colors.outline} />}
                            />
                            <TextInput
                                label="Email"
                                value={email}
                                mode="outlined"
                                disabled
                                style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
                                left={<TextInput.Icon icon="email" color={theme.colors.outline} />}
                            />

                            <Button
                                mode="contained"
                                onPress={handleSave}
                                loading={saving}
                                style={{ borderRadius: 12, paddingVertical: 6 }}
                                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                            >
                                Save Changes
                            </Button>
                        </Surface>

                        <Surface style={{ width: '100%', padding: 24, borderRadius: 24, backgroundColor: theme.colors.surface, elevation: 2, marginTop: 10 }}>
                            <Text variant="titleMedium" style={{ marginBottom: 20, fontWeight: 'bold' }}>Preferences</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
                        <TouchableOpacity onPress={() => setSignOutDialog({ ...signOutDialog, visible: true })} style={{ marginTop: 32, flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                            <Text style={{ color: theme.colors.error, fontWeight: 'bold', fontSize: 16 }}>Sign Out</Text>
                        </TouchableOpacity>

                        <Text style={{ marginTop: 20, color: theme.colors.outline, fontSize: 12 }}>Version 1.0.0</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Portal>
                <Dialog visible={signOutDialog.visible} onDismiss={() => setSignOutDialog({ ...signOutDialog, visible: false })} style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}>
                    <Dialog.Title style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>Sign Out</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Are you sure you want to sign out?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setSignOutDialog({ ...signOutDialog, visible: false })} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                        <Button onPress={async () => {
                            setSignOutDialog({ ...signOutDialog, visible: false });

                            // 1. Set offline status
                            if (session?.user?.id) {
                                await mockStore.setAvailability(session.user.id, 'offline');
                            }

                            // 2. Sign out
                            await signOut();

                            // 3. Explicitly navigate to login to prevent layout loop
                            // Use a small delay to allow state to settle if needed, or just replace.
                            // Actually, since layouts have redirects, manual replace is safer.
                            router.replace('/auth/login');
                        }} textColor={theme.colors.error}>Sign Out</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}
