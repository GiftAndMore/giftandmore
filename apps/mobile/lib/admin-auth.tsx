import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './auth';

// In a real app, this would be integrated with the main AuthContext or a separate provider
// For this mock admin, we'll keep it simple and separate.

interface AdminUser {
    id: string;
    email: string;
    role: 'admin' | 'assistant';
}

interface AdminAuthContextType {
    adminSession: AdminUser | null;
    adminUser?: AdminUser | null;
    loading: boolean;
    signInAdmin: (email: string, pass: string) => Promise<{ error: string | null }>;
    signOutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const { session, role, signIn, signOut, loading } = useAuth();

    const adminSession: AdminUser | null = useMemo(() => {
        return (session && (role === 'admin' || role === 'assistant'))
            ? { id: session.user.id, email: session.user.email, role: role as 'admin' | 'assistant' }
            : null;
    }, [session, role]);

    const signInAdmin = useCallback(async (email: string, pass: string) => {
        const result = await signIn(email, pass);
        if (result.error) return result;

        const { mockStore } = require('./mock-api');
        const user = await mockStore.verifyCredentials(email, pass);

        if (user && (user.role === 'admin' || user.role === 'assistant')) {
            return { error: null };
        } else {
            signOut();
            return { error: 'Access denied: Unauthorized role' };
        }
    }, [signIn, signOut]);

    const signOutAdmin = useCallback(async () => {
        signOut();
        // Use lazy import to avoid subscribing to nav state at provider level
        const { router } = require('expo-router');
        router.replace('/admin-portal/login');
    }, [signOut]);

    const contextValue = useMemo(() => ({
        adminSession,
        loading,
        signInAdmin,
        signOutAdmin
    }), [adminSession, loading, signInAdmin, signOutAdmin]);

    return (
        <AdminAuthContext.Provider value={contextValue}>
            {children}
        </AdminAuthContext.Provider>
    );
}
