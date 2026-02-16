import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { mockStore } from '../../../lib/mock-api';

export default function CreateBannerScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState('https://picsum.photos/400/200');
    const [linkTarget, setLinkTarget] = useState('');
    const [isActive, setIsActive] = useState(true);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 1], // Banner aspect ratio
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!title || !image) {
            Alert.alert('Error', 'Title and Image are required');
            return;
        }

        setSaving(true);
        try {
            await mockStore.createBanner({
                title,
                subtitle,
                image,
                link_target: linkTarget,
                is_active: isActive,
                sort_order: 0 // Default
            });
            Alert.alert('Success', 'Banner created');
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to create banner');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>New Banner</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.imageSection}>
                    <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: 'bold' }}>Banner Image</Text>

                    {image ? (
                        <View style={styles.imagePreview}>
                            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                            <Button mode="outlined" onPress={pickImage} icon="camera" style={styles.changeImageBtn}>
                                Change Image
                            </Button>
                        </View>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <IconButton icon="image-plus" size={40} iconColor={theme.colors.primary} onPress={pickImage} />
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No image selected</Text>
                            <Button mode="contained" onPress={pickImage} style={{ marginTop: 12 }}>
                                Upload Image
                            </Button>
                        </View>
                    )}

                    {/* Hidden URL input for fallback/debug, or toggleable */}
                    <View style={{ marginTop: 8 }}>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Image Source: {image ? (image.length > 50 ? 'Local File' : image) : 'None'}</Text>
                    </View>
                </View>
                <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
                <TextInput label="Subtitle" value={subtitle} onChangeText={setSubtitle} mode="outlined" style={styles.input} />
                <TextInput label="Link Target (e.g., /products/1)" value={linkTarget} onChangeText={setLinkTarget} mode="outlined" style={styles.input} />

                <View style={styles.switchRow}>
                    <Text variant="bodyLarge">Active Status</Text>
                    <Switch value={isActive} onValueChange={setIsActive} />
                </View>

                <Button mode="contained" onPress={handleCreate} loading={saving} style={styles.submitBtn}>
                    Create Banner
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 40 },
    form: { padding: 20 },
    imageSection: { marginBottom: 20 },
    imagePreview: { alignItems: 'center', marginBottom: 12 },
    previewImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: '#f0f0f0' },
    changeImageBtn: { borderColor: '#ccc' },
    placeholderContainer: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa'
    },
    input: { marginBottom: 12 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    submitBtn: { marginTop: 10 },
});
