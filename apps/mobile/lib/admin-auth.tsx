import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

// In a real app, this would be integrated with the main AuthContext or a separate provider
// For this mock admin, we'll keep it simple and separate.

interface AdminUser {
    id: string;
    email: string;
    role: 'admin';
}

interface AdminAuthContextType {
    adminSession: AdminUser | null;
    adminUser?: AdminUser | null; // Alias for backward compatibility if needed, or just use adminSession
    loading: boolean;
    signInAdmin: (email: string, pass: string) => Promise<{ error: string | null }>;
    signOutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [adminSession, setAdminSession] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        // Build: Simulate checking for persisted admin session
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const signInAdmin = async (email: string, pass: string) => {
        // MOCK AUTH
        return new Promise<{ error: string | null }>((resolve) => {
            setTimeout(() => {
                if (email === 'user@admin.com' && pass === 'Admin') {
                    setAdminSession({ id: 'admin-1', email, role: 'admin' });
                    resolve({ error: null });
                } else {
                    resolve({ error: 'Invalid admin credentials' });
                }
            }, 800);
        });
    };

    const signOutAdmin = async () => {
        setAdminSession(null);
        router.replace('/admin-portal/login');
    };

    return (
        <AdminAuthContext.Provider value={{ adminSession, loading, signInAdmin, signOutAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
