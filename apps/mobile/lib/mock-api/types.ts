export type Role = 'user' | 'assistant' | 'admin';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    avatar?: string;
    is_banned: boolean;
    created_at: string;
    assistant_tasks?: AssistantTask[];
    assistant_status?: 'online' | 'busy' | 'offline';
    last_active?: string;
    assistant_enabled?: boolean; // New field
}

export type AssistantTask = 'live_agent_support' | 'manage_products' | 'update_orders' | 'manage_banners' | 'manage_custom_requests';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sales_price?: number;
    sales_start_date?: string;
    sales_end_date?: string;
    category: ('Birthday' | 'Valentine' | 'Baby' | 'Anniversary' | 'Wedding' | 'Celebration' | 'Thank You' | 'Baby Shower' | 'General')[];
    gender?: 'Male' | 'Female' | 'Unisex';
    stock: number;
    images: string[];
    tags: string[];
    colors?: string[]; // Admin types these manually
    sizes?: string[]; // S,M,L or 14-46 or Ages
    rating?: number;
    reviews_count?: number;
}

export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link_target: string;
    is_active: boolean;
    sort_order: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled' | 'returned';

export interface OrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image: string;
}

export interface Order {
    id: string;
    user_id: string;
    user_name: string;
    items: OrderItem[];
    total_amount: number;
    status: OrderStatus;
    created_at: string;
    shipping_address: string;
    recipient_name: string;
    recipient_phone: string;
    notes?: string;
    timeline: { status: OrderStatus; date: string; note?: string }[];
}

export interface CustomRequest {
    id: string;
    user_id: string;
    user_name: string;
    purpose: string;
    budget: string;
    description: string;
    recipient_details: string;
    status: 'new' | 'in_review' | 'quoted' | 'paid' | 'closed';
    quote_amount?: number;
    quote_message?: string;
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string; // 'admin', 'system', or user_id
    text: string;
    created_at: string;
    is_system?: boolean;
}

export interface Conversation {
    id: string;
    user_id: string;
    user_name: string;
    assigned_to?: string; // assistant_id
    status: 'unassigned' | 'assigned' | 'resolved';
    messages: Message[];
    last_message_at: string;
    related_order_id?: string;
}

export type ActivityType = 'order_placed' | 'order_updated' | 'user_banned' | 'product_created' | 'product_updated' | 'banner_updated' | 'support_escalated' | 'request_submitted' | 'assistant_created' | 'assistant_updated' | 'assistant_deleted' | 'password_reset';

export interface ActivityEvent {
    id: string;
    type: ActivityType;
    description: string;
    performer_id?: string; // null if visible user action, or admin id
    performer_name?: string;
    created_at: string;
    metadata?: any;
}
