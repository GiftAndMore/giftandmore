import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { mockStore } from './mock-api';

type UserRole = 'user' | 'assistant' | 'admin';

interface MockUser {
    id: string;
    email: string;
    user_metadata: {
        full_name: string;
    };
}

interface MockSession {
    user: MockUser;
}

interface AuthContextType {
    session: MockSession | null;
    role: UserRole | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (data: { email: string; password: string; full_name: string; username: string }) => Promise<{ error: any; user?: any }>;
    signOut: () => void;
    updatePassword: (password: string) => Promise<{ error: any }>;
    isAdmin: boolean;
    isAssistant: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<{ session: MockSession | null; role: UserRole | null }>({
        session: null,
        role: null
    });
    const [loading, setLoading] = useState(true);

    const session = authState.session;
    const role = authState.role;

    useEffect(() => {
        // Simulate checking persistent storage
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        // Validate against mock store
        return new Promise<{ error: any }>(async (resolve) => {
            const user = await mockStore.verifyCredentials(email, password);
            if (user) {
                if (user.role === 'assistant' && user.assistant_enabled === false) {
                    resolve({ error: 'Account disabled. Contact admin.' });
                    return;
                }

                // Batch both updates into a single setState to prevent cascade
                setAuthState({
                    session: { user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } } },
                    role: user.role
                });
                resolve({ error: null });
            } else {
                resolve({ error: 'Invalid email or password' });
            }
        });
    }, []);

    const signUp = useCallback(async (data: { email: string, password: string, full_name: string, username: string }) => {
        return new Promise<{ error: any; user?: any }>(async (resolve) => {
            try {
                const newUser = await mockStore.createUser(data);
                resolve({ error: null, user: newUser });
            } catch (e: any) {
                resolve({ error: e.message || 'Failed to sign up' });
            }
        });
    }, []);

    const signOut = useCallback(() => {
        setAuthState({ session: null, role: null });
    }, []);

    const updatePassword = useCallback(async (password: string) => {
        return new Promise<{ error: any }>((resolve) => {
            setTimeout(() => {
                console.log('Mock Update Password to:', password);
                resolve({ error: null });
            }, 1000);
        });
    }, []);

    const contextValue = useMemo(() => ({
        session,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        updatePassword,
        isAdmin: role === 'admin',
        isAssistant: role === 'assistant' || role === 'admin'
    }), [session, role, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
