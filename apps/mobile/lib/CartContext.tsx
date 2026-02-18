
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    color?: string;
    size?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string, color?: string, size?: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (newItem: CartItem) => {
        setItems((prevItems) => {
            // Check if item already exists (matching id, color, and size)
            const existingItemIndex = prevItems.findIndex(
                (item) =>
                    item.productId === newItem.productId &&
                    item.color === newItem.color &&
                    item.size === newItem.size
            );

            if (existingItemIndex > -1) {
                // Update quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, newItem];
            }
        });
    };

    const removeFromCart = (productId: string, color?: string, size?: string) => {
        setItems((prevItems) =>
            prevItems.filter((item) =>
                !(item.productId === productId &&
                    (color ? item.color === color : true) &&
                    (size ? item.size === size : true))
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
