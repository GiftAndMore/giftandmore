import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, Appbar, Surface, Portal, Modal, List, Divider, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NIGERIAN_LOCATIONS } from '../../lib/locations';

// Schema
const schema = z.object({
    recipientName: z.string().min(1, { message: 'Recipient Name is required' }),
    recipientEmail: z.string().email({ message: 'Invalid email' }),
    recipientPhone: z.string().min(10, { message: 'Phone number is required' }),
    houseNumber: z.string().min(1, { message: 'House/Building number is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    lga: z.string().min(1, { message: 'Local Government Area is required' }),
    state: z.string().min(1, { message: 'State is required' }),
    note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SendGiftScreen() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [lgaModalVisible, setLgaModalVisible] = useState(false);

    const selectedState = watch('state');
    const availableStates = Object.keys(NIGERIAN_LOCATIONS);
    const availableLGAs = selectedState ? (NIGERIAN_LOCATIONS as any)[selectedState] : [];

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            // Mocking the order creation as requested previously
            console.log('Order Data:', data);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Redirect to Payment Screen
            router.push({
                pathname: '/checkout/payment',
                params: {
                    orderId: `MOCK-${Math.random().toString(36).substr(2, 9)}`,
                    amount: 50.00 // Fixed for now, can be calculated
                }
            });
        } catch (err: any) {
            Alert.alert('Error', 'Failed to process checkout. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderLocationItem = ({ item, onSelect }: { item: string, onSelect: () => void }) => (
        <List.Item
            title={item}
            onPress={onSelect}
            titleStyle={styles.listItemText}
        />
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Button icon="arrow-left" textColor="white" onPress={() => router.back()} style={{ minWidth: 0, padding: 0, margin: 0 }}>{''}</Button>
                    <Text variant="headlineSmall" style={{ color: 'white', fontWeight: 'bold' }}>Checkout</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Recipient Info</Text>

                    <Controller
                        control={control}
                        name="recipientName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Full Name"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.recipientName}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.recipientName}>
                        {errors.recipientName?.message}
                    </HelperText>

                    <Controller
                        control={control}
                        name="recipientEmail"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Email"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="email-address"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.recipientEmail}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.recipientEmail}>
                        {errors.recipientEmail?.message}
                    </HelperText>

                    <Controller
                        control={control}
                        name="recipientPhone"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Phone Number"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="phone-pad"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.recipientPhone}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.recipientPhone}>
                        {errors.recipientPhone?.message}
                    </HelperText>
                </Surface>

                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Delivery Address</Text>

                    <Controller
                        control={control}
                        name="houseNumber"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="House / Building Number & Street"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.houseNumber}
                            />
                        )}
                    />
                    <HelperText type="error" visible={!!errors.houseNumber}>
                        {errors.houseNumber?.message}
                    </HelperText>

                    {/* State Selector */}
                    <TouchableOpacity onPress={() => setStateModalVisible(true)}>
                        <View pointerEvents="none">
                            <TextInput
                                label="State"
                                mode="outlined"
                                value={watch('state')}
                                right={<TextInput.Icon icon="chevron-down" />}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                                error={!!errors.state}
                                editable={false}
                            />
                        </View>
                    </TouchableOpacity>
                    <HelperText type="error" visible={!!errors.state}>
                        {errors.state?.message}
                    </HelperText>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            {/* LGA Selector */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (!selectedState) {
                                        Alert.alert('Notice', 'Please select a State first');
                                        return;
                                    }
                                    setLgaModalVisible(true);
                                }}
                            >
                                <View pointerEvents="none">
                                    <TextInput
                                        label="LGA"
                                        mode="outlined"
                                        value={watch('lga')}
                                        right={<TextInput.Icon icon="chevron-down" />}
                                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                        outlineStyle={styles.inputOutline}
                                        error={!!errors.lga}
                                        editable={false}
                                    />
                                </View>
                            </TouchableOpacity>
                            <HelperText type="error" visible={!!errors.lga}>
                                {errors.lga?.message}
                            </HelperText>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="city"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        label="City"
                                        mode="outlined"
                                        value={value}
                                        onChangeText={onChange}
                                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                        outlineStyle={styles.inputOutline}
                                        error={!!errors.city}
                                    />
                                )}
                            />
                            <HelperText type="error" visible={!!errors.city}>
                                {errors.city?.message}
                            </HelperText>
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="note"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Gift Note (Optional)"
                                mode="outlined"
                                value={value}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={2}
                                style={[styles.input, { textAlignVertical: 'top', backgroundColor: theme.colors.surface }]}
                                outlineStyle={styles.inputOutline}
                            />
                        )}
                    />
                </Surface>

                <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    contentStyle={{ height: 50 }}
                >
                    Continue to Payment
                </Button>
            </ScrollView>

            {/* Modals for Dropdowns */}
            <Portal>
                {/* State Modal */}
                <Modal
                    visible={stateModalVisible}
                    onDismiss={() => setStateModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>Select State</Text>
                    <Divider />
                    <ScrollView style={{ maxHeight: 400 }}>
                        {availableStates.map(st => (
                            <List.Item
                                key={st}
                                title={st}
                                onPress={() => {
                                    setValue('state', st);
                                    setValue('lga', ''); // Clear LGA when state changes
                                    setStateModalVisible(false);
                                }}
                                titleStyle={styles.listItemText}
                            />
                        ))}
                    </ScrollView>
                </Modal>

                {/* LGA Modal */}
                <Modal
                    visible={lgaModalVisible}
                    onDismiss={() => setLgaModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>Select LGA</Text>
                    <Divider />
                    <ScrollView style={{ maxHeight: 400 }}>
                        {availableLGAs.map((lga: string) => (
                            <List.Item
                                key={lga}
                                title={lga}
                                onPress={() => {
                                    setValue('lga', lga);
                                    setLgaModalVisible(false);
                                }}
                                titleStyle={styles.listItemText}
                            />
                        ))}
                    </ScrollView>
                </Modal>
            </Portal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingHorizontal: 8,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4
    },
    content: { padding: 16, paddingBottom: 40 },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
    input: { marginBottom: 2 },
    inputOutline: { borderRadius: 12 },
    button: { borderRadius: 12, backgroundColor: '#6D28D9', marginTop: 10, marginBottom: 20 },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 20,
        padding: 10,
    },
    modalTitle: {
        padding: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listItemText: {
        fontSize: 16,
        color: '#374151',
    }
});
