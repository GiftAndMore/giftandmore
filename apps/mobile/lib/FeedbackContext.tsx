import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface FeedbackContextType {
    showAlert: (title: string, message: string, actions?: FeedbackAction[], type?: FeedbackType) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [actions, setActions] = useState<FeedbackAction[]>([]);
    const [type, setType] = useState<FeedbackType>('info');
    const theme = useTheme();

    const showAlert = (title: string, message: string, actions: FeedbackAction[] = [{ text: 'OK' }], type: FeedbackType = 'info') => {
        setTitle(title);
        setMessage(message);
        setActions(actions);
        setType(type);
        setVisible(true);
    };

    const hideAlert = () => {
        setVisible(false);
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'alert';
            default: return 'information';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return theme.colors.primary; // Or a specific success color like #10B981
            case 'error': return theme.colors.error;
            case 'warning': return theme.colors.secondary;
            default: return theme.colors.primary;
        }
    };

    return (
        <FeedbackContext.Provider value={{ showAlert }}>
            {children}
            <Portal>
                <Dialog visible={visible} onDismiss={hideAlert} style={[styles.dialog, { backgroundColor: theme.colors.surface, borderRadius: theme.roundness * 1.5 }]}>
                    <View style={styles.contentContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.elevation.level2 }]}>
                            <MaterialCommunityIcons name={getIcon()} size={48} color={getColor()} />
                        </View>
                        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
                        <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
                    </View>
                    <Dialog.Actions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                mode="contained" // Make buttons more prominent
                                onPress={() => {
                                    if (action.onPress) action.onPress();
                                    hideAlert();
                                }}
                                style={{ marginHorizontal: 4, borderRadius: 20, minWidth: 100, backgroundColor: action.style === 'destructive' ? theme.colors.error : theme.colors.primary }}
                                textColor={theme.colors.surface} // Text color for contained button
                                contentStyle={{ height: 44 }}
                            >
                                {action.text}
                            </Button>
                        ))}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </FeedbackContext.Provider>
    );
}

const styles = StyleSheet.create({
    dialog: {
        paddingTop: 20,
        paddingBottom: 8,
        maxWidth: 340,
        alignSelf: 'center',
        width: '90%'
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8
    },
    message: {
        textAlign: 'center',
        opacity: 0.8
    }
});

export function useFeedback() {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
}
