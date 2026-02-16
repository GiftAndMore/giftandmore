import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { mockStore, Banner } from '../../../lib/mock-api';

export default function EditBannerScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [banner, setBanner] = useState<Banner | null>(null);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState('');
    const [linkTarget, setLinkTarget] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadBanner();
    }, [id]);

    const loadBanner = async () => {
        const banners = await mockStore.getBanners();
        const found = banners.find(b => b.id === id);
        if (found) {
            setBanner(found);
            setTitle(found.title);
            setSubtitle(found.subtitle);
            setImage(found.image);
            setLinkTarget(found.link_target);
            setIsActive(found.is_active);
        } else {
            Alert.alert('Error', 'Banner not found');
            router.back();
        }
        setLoading(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!banner) return;
        setSaving(true);
        try {
            await mockStore.updateBanner(banner.id, {
                title,
                subtitle,
                image,
                link_target: linkTarget,
                is_active: isActive
            });
            Alert.alert('Success', 'Banner updated');
        } catch (e) {
            Alert.alert('Error', 'Failed to update banner');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Banner',
            'Are you sure you want to delete this banner?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await mockStore.deleteBanner(banner!.id);
                            router.back();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete banner');
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
    if (!banner) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Edit Banner</Text>
                <IconButton icon="delete" iconColor={theme.colors.error} onPress={handleDelete} />
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

                    <View style={{ marginTop: 8 }}>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Image Source: {image ? (image.length > 50 ? 'Local File' : image) : 'None'}</Text>
                    </View>
                </View>

                <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
                <TextInput label="Subtitle" value={subtitle} onChangeText={setSubtitle} mode="outlined" style={styles.input} />
                <TextInput label="Link Target" value={linkTarget} onChangeText={setLinkTarget} mode="outlined" style={styles.input} />

                <View style={styles.switchRow}>
                    <Text variant="bodyLarge">Active Status</Text>
                    <Switch value={isActive} onValueChange={setIsActive} />
                </View>

                <Button mode="contained" onPress={handleSave} loading={saving} style={styles.submitBtn}>
                    Save Changes
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingTop: 40 },
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
