import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar, useTheme, Surface, IconButton, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function PersonalInfoScreen() {
    const router = useRouter();
    const theme = useTheme();

    // Mock initial user data
    const [formData, setFormData] = useState({
        fullName: 'Shilley User',
        username: 'shilley_24',
        email: 'user@example.com',
        mobile: '+234 800 000 0000',
        gender: 'Female',
        dob: '1995-05-15',
        maritalStatus: 'Single',
        city: 'Lagos',
        country: 'Nigeria',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setDialogVisible(true);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => router.push('/(tabs)/profile')} />
                    <Text style={styles.headerTitle}>My Personal Info</Text>
                </View>

                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={100}
                        source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shilley' }}
                        style={styles.avatar}
                    />
                    <IconButton
                        icon="camera"
                        mode="contained"
                        containerColor={theme.colors.surface}
                        iconColor={theme.colors.primary}
                        size={20}
                        style={styles.cameraBtn}
                        onPress={() => { }}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Basic Information</Text>

                    <TextInput
                        label="Full Name"
                        value={formData.fullName}
                        onChangeText={(t) => setFormData({ ...formData, fullName: t })}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        textColor={theme.colors.onSurface}
                    />

                    <TextInput
                        label="Username"
                        value={formData.username}
                        onChangeText={(t) => setFormData({ ...formData, username: t })}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        textColor={theme.colors.onSurface}
                    />

                    <TextInput
                        label="Email (Read-only)"
                        value={formData.email}
                        mode="outlined"
                        disabled
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        textColor={theme.colors.onSurface}
                    />

                    <TextInput
                        label="Mobile Number"
                        value={formData.mobile}
                        onChangeText={(t) => setFormData({ ...formData, mobile: t })}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        textColor={theme.colors.onSurface}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <TextInput
                                label="Gender"
                                value={formData.gender}
                                mode="outlined"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                textColor={theme.colors.onSurface}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <TextInput
                                label="Marital Status"
                                value={formData.maritalStatus}
                                mode="outlined"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                textColor={theme.colors.onSurface}
                            />
                        </View>
                    </View>

                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 16 }]}>Location & Dates</Text>

                    <TextInput
                        label="Date of Birth"
                        value={formData.dob}
                        placeholder="YYYY-MM-DD"
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        textColor={theme.colors.onSurface}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <TextInput
                                label="City"
                                value={formData.city}
                                onChangeText={(t) => setFormData({ ...formData, city: t })}
                                mode="outlined"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                textColor={theme.colors.onSurface}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <TextInput
                                label="Country"
                                value={formData.country}
                                onChangeText={(t) => setFormData({ ...formData, country: t })}
                                mode="outlined"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                textColor={theme.colors.onSurface}
                            />
                        </View>
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={isSaving}
                        disabled={isSaving}
                        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={{ height: 50 }}
                    >
                        Save Changes
                    </Button>
                </Surface>
            </ScrollView>

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ backgroundColor: theme.colors.surface }}>
                    <Dialog.Title style={{ color: theme.colors.onSurface }}>Success</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Profile updated successfully</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        elevation: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 24, marginLeft: 10 },
    avatarContainer: { alignItems: 'center', marginTop: 15 },
    avatar: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
    cameraBtn: { position: 'absolute', bottom: -10, right: '35%' },
    content: { padding: 16 },
    formCard: { borderRadius: 24, padding: 20, marginTop: 10, elevation: 2 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
    input: { marginBottom: 4, backgroundColor: 'transparent' },
    inputOutline: { borderRadius: 12 },
    row: { flexDirection: 'row' },
    saveBtn: { marginTop: 20, borderRadius: 12 }
});
