import { createContext, useContext, useEffect, useState } from 'react';

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
    signUp: (data: { email: string; password: string; full_name: string; username: string }) => Promise<{ error: any }>;
    signOut: () => void;
    updatePassword: (password: string) => Promise<{ error: any }>;
    isAdmin: boolean;
    isAssistant: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<MockSession | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking persistent storage
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const signIn = async (email: string, password: string) => {
        // Mock sign in - accepts anything
        return new Promise<{ error: any }>((resolve) => {
            setTimeout(() => {
                const mockUser: MockUser = {
                    id: 'mock-123',
                    email: email,
                    user_metadata: { full_name: email.split('@')[0] }
                };
                setSession({ user: mockUser });
                setRole('user'); // Default to user
                resolve({ error: null });
            }, 800);
        });
    };

    const signUp = async (data: { email: string, password: string, full_name: string, username: string }) => {
        // Mock sign up
        return new Promise<{ error: any }>((resolve) => {
            setTimeout(() => {
                // In a real scenario, we'd store this in Supabase
                console.log('Mock Signup with:', data);
                resolve({ error: null });
            }, 800);
        });
    };

    const signOut = () => {
        setSession(null);
        setRole(null);
    };

    const updatePassword = async (password: string) => {
        return new Promise<{ error: any }>((resolve) => {
            setTimeout(() => {
                console.log('Mock Update Password to:', password);
                resolve({ error: null });
            }, 1000);
        });
    };

    return (
        <AuthContext.Provider value={{
            session,
            role,
            loading,
            signIn,
            signUp,
            signOut,
            updatePassword,
            isAdmin: role === 'admin',
            isAssistant: role === 'assistant' || role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
}
