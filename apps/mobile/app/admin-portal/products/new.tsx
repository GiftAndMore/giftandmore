import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, ScrollView, StyleSheet, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, Chip, SegmentedButtons, Portal, Surface, Dialog, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { mockStore, Product } from '../../../lib/mock-api';

const CATEGORIES = ['Birthday', 'Valentine', 'Baby', 'Anniversary', 'Wedding', 'Celebration', 'Thank You', 'Baby Shower', 'General'];
const GENDERS = ['Male', 'Female', 'Unisex'];
const SIZES_ADULT = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SIZES_NUMERIC = Array.from({ length: 33 }, (_, i) => (14 + i).toString()); // 14 to 46
const SIZES_BABY = ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m'];

const CustomDatePicker = ({ visible, onClose, onSelect, title }: { visible: boolean, onClose: () => void, onSelect: (date: string) => void, title: string }) => {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const generateDays = () => {
        const days = [];
        const numDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
        for (let i = 1; i <= numDays; i++) {
            days.push(i);
        }
        return days;
    };

    const handleSelect = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onSelect(dateStr);
        onClose();
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Surface style={[styles.modalContent, { backgroundColor: theme.colors.surface }]} elevation={4}>
                    <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>{title}</Text>
                    <View style={styles.calendarHeader}>
                        <IconButton icon="chevron-left" onPress={() => changeMonth(-1)} />
                        <Text style={{ fontWeight: 'bold' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
                        <IconButton icon="chevron-right" onPress={() => changeMonth(1)} />
                    </View>
                    <View style={styles.calendarGrid}>
                        {generateDays().map(day => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayCell, { backgroundColor: theme.colors.surfaceVariant }]}
                                onPress={() => handleSelect(day)}
                            >
                                <Text>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Button onPress={onClose} style={{ marginTop: 16 }}>Cancel</Button>
                </Surface>
            </View>
        </Modal>
    );
};

export default function AddProductScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Dialog State
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{ title: string; message: string; isError?: boolean; onDismiss?: () => void }>({ title: '', message: '' });

    const showDialog = (title: string, message: string, isError = false, onDismiss?: () => void) => {
        setDialogConfig({ title, message, isError, onDismiss });
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
        if (dialogConfig.onDismiss) {
            dialogConfig.onDismiss();
        }
    };

    // Basic Info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categories, setCategories] = useState<string[]>(['General']); // Changed to array
    const [gender, setGender] = useState('Unisex');

    // Sales Info
    const [salesPrice, setSalesPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Variants
    const [images, setImages] = useState<string[]>(['https://picsum.photos/300']);
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sizeType, setSizeType] = useState<'Standard' | 'Numeric'>('Standard');

    // Helpers
    const handleAddColor = () => {
        if (colorInput.trim() && !colors.includes(colorInput.trim())) {
            setColors([...colors, colorInput.trim()]);
            setColorInput('');
        }
    };

    const handleRemoveColor = (color: string) => {
        setColors(colors.filter(c => c !== color));
    };

    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const toggleCategory = (cat: string) => {
        if (categories.includes(cat)) {
            setCategories(categories.filter(c => c !== cat));
        } else {
            setCategories([...categories, cat]);
        }
    };

    const addImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const getAvailableSizes = () => {
        if (categories.includes('Baby')) return SIZES_BABY; // Priority to baby sizes if Baby category selected
        return sizeType === 'Standard' ? SIZES_ADULT : SIZES_NUMERIC;
    };

    const handleCreate = async () => {
        if (!name || !price || categories.length === 0) {
            showDialog('Error', 'Please fill in Name, Price, and at least one Category', true);
            return;
        }

        if (salesPrice && startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                showDialog('Error', 'Sales End Date must be after Start Date', true);
                return;
            }
        }

        setLoading(true);
        try {
            await mockStore.createProduct({
                name,
                description,
                price: parseFloat(price) || 0,
                sales_price: salesPrice ? parseFloat(salesPrice) : undefined,
                sales_start_date: startDate,
                sales_end_date: endDate,
                category: categories as any, // Cast to match updated type
                gender: gender as any,
                stock: parseInt(stock) || 0,
                images: images,
                tags: [],
                colors,
                sizes: selectedSizes
            });
            showDialog('Success', 'Product created successfully', false, () => router.back());
        } catch (e) {
            showDialog('Error', 'Failed to create product', true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Add New Product</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.form}>
                {/* Images */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Product Images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    {images.map((img, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri: img }} style={styles.image} />
                            <IconButton icon="close-circle" size={20} style={styles.removeImageBtn} onPress={() => removeImage(index)} />
                        </View>
                    ))}
                    <TouchableOpacity style={[styles.addImageBtn, { borderColor: theme.colors.primary }]} onPress={addImage}>
                        <IconButton icon="camera-plus" iconColor={theme.colors.primary} />
                        <Text style={{ color: theme.colors.primary }}>Add Media</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Basic Details */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Basic Details</Text>
                <TextInput label="Product Name *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />

                <TextInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={6}
                    style={[styles.input, { minHeight: 120 }]}
                />

                <View style={styles.row}>
                    <TextInput label="Price (₦) *" value={price} onChangeText={setPrice} keyboardType="numeric" mode="outlined" style={[styles.input, styles.halfInput]} />
                    <TextInput label="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" mode="outlined" style={[styles.input, styles.halfInput]} />
                </View>

                {/* Sales */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Sales & Offers (Optional)</Text>
                <TextInput label="Sales Price (₦)" value={salesPrice} onChangeText={setSalesPrice} keyboardType="numeric" mode="outlined" style={styles.input} />

                <View style={styles.row}>
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.halfInput, { marginBottom: 12 }]}>
                        <View pointerEvents="none">
                            <TextInput
                                label="Start Date"
                                value={startDate}
                                mode="outlined"
                                right={<TextInput.Icon icon="calendar" />}
                                style={styles.inputNoMargin} // Helper style
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.halfInput, { marginBottom: 12 }]}>
                        <View pointerEvents="none">
                            <TextInput
                                label="End Date"
                                value={endDate}
                                mode="outlined"
                                right={<TextInput.Icon icon="calendar" />}
                                style={styles.inputNoMargin}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                <CustomDatePicker
                    visible={showStartPicker}
                    onClose={() => setShowStartPicker(false)}
                    onSelect={setStartDate}
                    title="Select Start Date"
                />
                <CustomDatePicker
                    visible={showEndPicker}
                    onClose={() => setShowEndPicker(false)}
                    onSelect={setEndDate}
                    title="Select End Date"
                />

                {/* Category & Gender */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Categories (Select multiple)</Text>
                <View style={styles.chipsContainer}>
                    {CATEGORIES.map(cat => (
                        <Chip
                            key={cat}
                            selected={categories.includes(cat)}
                            onPress={() => toggleCategory(cat)}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            {cat}
                        </Chip>
                    ))}
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>Gender</Text>
                <SegmentedButtons
                    value={gender}
                    onValueChange={setGender}
                    buttons={GENDERS.map(g => ({ value: g, label: g }))}
                    style={styles.input}
                />

                {/* Variants */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Variants</Text>

                {/* Colors */}
                <View style={styles.row}>
                    <TextInput
                        label="Add Color (Type & Enter)"
                        value={colorInput}
                        onChangeText={setColorInput}
                        onSubmitEditing={handleAddColor}
                        right={<TextInput.Icon icon="plus" onPress={handleAddColor} />}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                    />
                </View>
                <View style={styles.chipsContainer}>
                    {colors.map(c => (
                        <Chip key={c} onClose={() => handleRemoveColor(c)} style={styles.chip}>{c}</Chip>
                    ))}
                </View>

                {/* Sizes */}
                <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Sizes ({categories.includes('Baby') ? 'Age' : sizeType})</Text>
                {!categories.includes('Baby') && (
                    <SegmentedButtons
                        value={sizeType}
                        onValueChange={setSizeType as any}
                        buttons={[
                            { value: 'Standard', label: 'XS - XXL' },
                            { value: 'Numeric', label: '14 - 46' },
                        ]}
                        style={[styles.input, { marginBottom: 12 }]}
                        density="small"
                    />
                )}
                <View style={styles.chipsContainer}>
                    {getAvailableSizes().map(s => (
                        <Chip key={s} selected={selectedSizes.includes(s)} onPress={() => toggleSize(s)} style={styles.sizeChip} showSelectedOverlay>{s}</Chip>
                    ))}
                </View>

                <Button mode="contained" onPress={handleCreate} loading={loading} style={styles.submitBtn} contentStyle={{ height: 50 }}>
                    Create Product
                </Button>
            </View>

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={hideDialog} style={{ backgroundColor: theme.colors.elevation.level3, borderRadius: 28 }}>
                    <Dialog.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <View style={{
                            backgroundColor: dialogConfig.isError ? theme.colors.errorContainer : 'rgba(74, 222, 128, 0.15)',
                            padding: 16,
                            borderRadius: 50,
                            marginBottom: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Icon
                                source={dialogConfig.isError ? "alert-circle" : "check-circle"}
                                size={40}
                                color={dialogConfig.isError ? theme.colors.error : '#4ADE80'}
                            />
                        </View>
                        <Text variant="headlineSmall" style={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: theme.colors.onSurface,
                            marginBottom: 8
                        }}>
                            {dialogConfig.title}
                        </Text>
                        <Text variant="bodyMedium" style={{
                            textAlign: 'center',
                            color: theme.colors.onSurfaceVariant,
                            paddingHorizontal: 8
                        }}>
                            {dialogConfig.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                        <Button
                            mode="contained"
                            onPress={hideDialog}
                            style={{ flex: 1, borderRadius: 100 }}
                            contentStyle={{ paddingVertical: 6 }}
                            buttonColor={dialogConfig.isError ? theme.colors.error : theme.colors.primary}
                            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        >
                            Okay
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingTop: 40 },
    form: { padding: 20, paddingBottom: 50 },
    sectionTitle: { marginTop: 24, marginBottom: 12, fontWeight: 'bold' },
    input: { marginBottom: 12 },
    inputNoMargin: { marginBottom: 0 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    halfInput: { flex: 1 },
    imageScroll: { flexDirection: 'row', marginBottom: 16 },
    imageContainer: { marginRight: 10, position: 'relative' },
    image: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#eee' },
    removeImageBtn: { position: 'absolute', top: -10, right: -10, margin: 0 },
    addImageBtn: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { marginBottom: 4 },
    sizeChip: { minWidth: 50, justifyContent: 'center' },
    submitBtn: { marginTop: 32 },

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '85%', padding: 20, borderRadius: 12 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    dayCell: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }
});
