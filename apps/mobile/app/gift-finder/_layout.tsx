import { Stack } from 'expo-router';

export default function GiftFinderLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Recipient' }} />
            <Stack.Screen name="purpose" options={{ title: 'Occasion' }} />
            <Stack.Screen name="budget" options={{ title: 'Budget' }} />
            <Stack.Screen name="suggestions" options={{ title: 'Suggestions' }} />
        </Stack>
    );
}
