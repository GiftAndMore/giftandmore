import { View, Alert, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default function ChatMediaAttachment({ onSend }: { onSend: (url: string, type: string) => void }) {
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const theme = useTheme();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const fileName = `${Date.now()}.jpg`;

            const { data, error } = await supabase.storage
                .from('chat-media')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg'
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
            onSend(publicUrl, 'image/jpeg');
            setImage(null);
        } catch (e: any) {
            Alert.alert('Upload failed', e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <IconButton
                icon="image-plus"
                iconColor={theme.colors.primary}
                size={28}
                onPress={pickImage}
                disabled={uploading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 0 }
});
