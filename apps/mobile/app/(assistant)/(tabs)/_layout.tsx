import { Tabs } from 'expo-router';
import { useAuth } from '../../../lib/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function AssistantTabsLayout() {
    const { session } = useAuth();
    const theme = useTheme();

    // In a real database, we'd fetch the user's permissions.
    // Here we use the session user metadata or we might need to fetch the full user object if metadata is stale.
    // AuthContext session.user only has basic info.
    // However, mockStore.verifyCredentials returns the full user, and AuthProvider sets session with that.
    // BUT AuthProvider session struct is: { user: { id, email, user_metadata: { full_name } } }
    // It does NOT store `assistant_tasks` in session!
    // We need to fetch the full user profile to know the tasks.
    // OR update AuthProvider to include `assistant_tasks` in session?

    // Better: Fetch user profile here or use a `useUserProfile` hook?
    // For now, let's assume we can fetch it or just check mockStore directly?
    // We can't use async in the component body for layout configuration easily.
    // Standard pattern: render all tabs, but use `href: null` to hide them if no permission.

    // Actually, we can fetch tasks in a useEffect and store in state, but Tabs returned must be static-ish?
    // Dynamic tabs in Expo Router are tricky.
    // Easier approach: Define all tabs, but use `href: null` to hide them if no permission.

    // Let's rely on standard Tabs for now and simply show all, 
    // BUT since we need to HIDE them, we need `assistant_tasks`.
    // I need to update `auth.tsx` to optionally expose `user` full object or at least `assistant_tasks`.

    // Let's update `auth.tsx` next to include `assistant_tasks` in session or a separate context field.
    // For now, I will render the Tabs and assume I'll fix the visibility logic.

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            headerShown: false,
            tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outlineVariant,
            }
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="live-agent"
                options={{
                    title: 'Support',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="headset" size={24} color={color} />,
                    // href: hasPermission('live_agent_support') ? '/(assistant)/(tabs)/live-agent' : null
                }}
            />
            <Tabs.Screen
                name="assistant-orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="package-variant" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="tag" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="banners"
                options={{
                    title: 'Banners',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="image" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="requests"
                options={{
                    title: 'Requests',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-text" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
