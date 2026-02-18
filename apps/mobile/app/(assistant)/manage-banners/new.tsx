import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, Switch, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { mockStore } from '../../../lib/mock-api';
import * as ImagePicker from 'expo-image-picker';

export default function NewBannerScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [saving, setSaving] = useState(false);
    const [dialog, setDialog] = useState({ visible: false, title: '', message: '', isError: false });

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [isActive, setIsActive] = useState(true);

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

    const handleCreate = async () => {
        if (!image) {
            setDialog({ visible: true, title: 'Error', message: 'Please select an image', isError: true });
            return;
        }

        setSaving(true);
        try {
            await mockStore.createBanner({
                title, subtitle, image, cta_link: ctaLink, is_active: isActive
            });
            setDialog({ visible: true, title: 'Success', message: 'Banner created', isError: false });
            router.back();
        } catch (e) {
            setDialog({ visible: true, title: 'Error', message: 'Failed to create banner', isError: true });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingTop: 40 }}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>New Banner</Text>
                <View style={{ width: 48 }} />
            </View>

            <View style={{ padding: 20 }}>
                <TouchableOpacity onPress={pickImage} style={{ height: 180, backgroundColor: '#eee', borderRadius: 12, marginBottom: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <IconButton icon="camera" />
                            <Text>Tap to select image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
                <TextInput label="Subtitle" value={subtitle} onChangeText={setSubtitle} mode="outlined" style={styles.input} />
                <TextInput label="CTA Link (e.g., /products)" value={ctaLink} onChangeText={setCtaLink} mode="outlined" style={styles.input} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 }}>
                    <Text variant="bodyLarge">Active</Text>
                    <Switch value={isActive} onValueChange={setIsActive} />
                </View>

                <Button mode="contained" onPress={handleCreate} loading={saving} style={{ marginTop: 20 }}>
                    Create Banner
                </Button>
            </View>

            <Portal>
                <Dialog visible={dialog.visible} onDismiss={() => setDialog({ ...dialog, visible: false })} style={{ backgroundColor: theme.dark ? '#1E293B' : theme.colors.surface }}>
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <MaterialCommunityIcons
                            name={dialog.isError ? 'alert-circle' : 'check-circle'}
                            size={48}
                            color={dialog.isError ? theme.colors.error : '#10B981'}
                        />
                    </View>
                    <Dialog.Title style={{ textAlign: 'center', color: dialog.isError ? theme.colors.error : '#10B981' }}>
                        {dialog.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            {dialog.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        <Button onPress={() => setDialog({ ...dialog, visible: false })} contentStyle={{ paddingHorizontal: 24 }}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    input: { marginBottom: 12 }
});
