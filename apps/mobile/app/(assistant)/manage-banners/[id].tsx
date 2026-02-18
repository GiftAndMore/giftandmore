import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, Switch, Portal, Dialog } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { mockStore, Banner } from '../../../lib/mock-api';
import * as ImagePicker from 'expo-image-picker';

export default function BannerDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const [banner, setBanner] = useState<Banner | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialog, setDialog] = useState({ visible: false, title: '', message: '', isError: false, isConfirm: false, onConfirm: null as (() => void) | null });

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        loadBanner();
    }, [id]);

    const loadBanner = async () => {
        setLoading(true);
        const data = await mockStore.getBanner(id as string);
        if (data) {
            setBanner(data);
            setTitle(data.title || '');
            setSubtitle(data.subtitle || '');
            setImage(data.image);
            setCtaLink(data.cta_link || '');
            setIsActive(data.is_active || false);
        }
        setLoading(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await mockStore.updateBanner(id as string, {
                title, subtitle, image, cta_link: ctaLink, is_active: isActive
            });
            setDialog({ visible: true, title: 'Success', message: 'Banner updated', isError: false, isConfirm: false, onConfirm: null });
        } catch (e) {
            setDialog({ visible: true, title: 'Error', message: 'Failed to update banner', isError: true, isConfirm: false, onConfirm: null });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {

        setDialog({
            visible: true,
            title: 'Delete Banner',
            message: 'Delete this banner?',
            isError: false,
            isConfirm: true,
            onConfirm: async () => {
                await mockStore.deleteBanner(id as string);
                router.back();
            }
        });
    };

    if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><Text>Loading...</Text></View>;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingTop: 40 }}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Edit Banner</Text>
                <IconButton icon="delete" iconColor={theme.colors.error} onPress={handleDelete} />
            </View>

            <View style={{ padding: 20 }}>
                <TouchableOpacity onPress={pickImage} style={{ height: 180, backgroundColor: '#eee', borderRadius: 12, marginBottom: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <Text>Tap to select image</Text>
                    )}
                </TouchableOpacity>

                <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
                <TextInput label="Subtitle" value={subtitle} onChangeText={setSubtitle} mode="outlined" style={styles.input} />
                <TextInput label="CTA Link (e.g., /products)" value={ctaLink} onChangeText={setCtaLink} mode="outlined" style={styles.input} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 }}>
                    <Text variant="bodyLarge">Active</Text>
                    <Switch value={isActive} onValueChange={setIsActive} />
                </View>

                <Button mode="contained" onPress={handleSave} loading={saving} style={{ marginTop: 20 }}>
                    Save Changes
                </Button>
            </View>

            <Portal>
                <Dialog visible={dialog.visible} onDismiss={() => setDialog({ ...dialog, visible: false })} style={{ backgroundColor: theme.dark ? '#1E293B' : theme.colors.surface }}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons
                            name={dialog.isError ? 'alert-circle' : dialog.isConfirm ? 'help-circle' : 'check-circle'}
                            size={48}
                            color={dialog.isError ? theme.colors.error : dialog.isConfirm ? theme.colors.primary : '#10B981'}
                        />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', color: dialog.isError ? theme.colors.error : dialog.isConfirm ? theme.colors.primary : '#10B981' }}>
                        {dialog.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            {dialog.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        {!dialog.isConfirm ? (
                            <Button onPress={() => setDialog({ ...dialog, visible: false })} contentStyle={{ paddingHorizontal: 24 }}>OK</Button>
                        ) : (
                            <>
                                <Button onPress={() => setDialog({ ...dialog, visible: false })} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                                <Button onPress={() => {
                                    setDialog({ ...dialog, visible: false });
                                    dialog.onConfirm?.();
                                }} textColor={theme.colors.error}>Delete</Button>
                            </>
                        )}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    input: { marginBottom: 12 }
});
