import { User, Product, Order, Banner, CustomRequest, Conversation, ActivityEvent } from './types';

export const MOCK_USERS: User[] = [
    { id: 'u1', email: 'user@admin.com', full_name: 'Super Admin', role: 'admin', is_banned: false, created_at: '2023-01-01T00:00:00Z', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { id: 'u2', email: 'sarah@assistant.com', full_name: 'Sarah Support', role: 'assistant', is_banned: false, created_at: '2023-02-01T00:00:00Z', assistant_tasks: ['live_agent_support', 'update_orders'], assistant_status: 'online', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 'u3', email: 'mike@assistant.com', full_name: 'Mike Manager', role: 'assistant', is_banned: false, created_at: '2023-02-15T00:00:00Z', assistant_tasks: ['manage_products', 'manage_banners'], assistant_status: 'busy', avatar: 'https://i.pravatar.cc/150?u=mike' },
    { id: 'u4', email: 'john.doe@gmail.com', full_name: 'John Doe', role: 'user', is_banned: false, created_at: '2023-03-10T10:00:00Z', avatar: 'https://i.pravatar.cc/150?u=john' },
    { id: 'u5', email: 'jane.smith@yahoo.com', full_name: 'Jane Smith', role: 'user', is_banned: false, created_at: '2023-03-12T14:30:00Z', avatar: 'https://i.pravatar.cc/150?u=jane' },
    { id: 'u6', email: 'banned.guy@bad.com', full_name: 'Banned Guy', role: 'user', is_banned: true, created_at: '2023-04-01T09:00:00Z' },
    // Add more mock users as needed
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Luxury Rose Box', description: 'Red roses in a velvet box.', price: 45000, category: 'Flowers', tags: ['Romance', 'Anniversary', 'Women'], images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'], is_active: true, stock: 10 },
    { id: 'p2', name: 'Teddy Bear XL', description: 'Giant cuddly teddy bear.', price: 25000, category: 'Toys', tags: ['Romance', 'Birthday', 'Baby', 'Kids'], images: ['https://images.unsplash.com/photo-1559454403-b8fb9850601f?w=500'], is_active: true, stock: 5 },
    { id: 'p3', name: 'Gourmet Chocolate Set', description: 'Assorted swiss chocolates.', price: 15000, category: 'Food', tags: ['Birthday', 'Thank You'], images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500'], is_active: true, stock: 20 },
    { id: 'p4', name: 'Spa Gift Basket', description: 'Relaxing spa essentials.', price: 35000, category: 'Wellness', tags: ['Self Care', 'Women', 'Mothers Day'], images: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500'], is_active: true, stock: 8 },
    { id: 'p5', name: 'Men\'s Grooming Kit', description: 'Beard oil, comb, and wash.', price: 20000, category: 'Wellness', tags: ['Men', 'Fathers Day'], images: ['https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=500'], is_active: true, stock: 15 },
    { id: 'p6', name: 'Custom Engraved Watch', description: 'Classic timepiece.', price: 85000, category: 'Accessories', tags: ['Men', 'Anniversary', 'Wedding'], images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'], is_active: true, stock: 3 },
    { id: 'p7', name: 'Baby Hamper', description: 'Essentials for newborn.', price: 30000, category: 'Baby', tags: ['Baby', 'Shower'], images: ['https://images.unsplash.com/photo-1555255707-c07966088b7b?w=500'], is_active: true, stock: 12 },
    { id: 'p8', name: 'Perfume Gift Set', description: 'Designer fragrance.', price: 55000, category: 'Beauty', tags: ['Women', 'Romance'], images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'], is_active: true, stock: 6 },
    { id: 'p9', name: 'Corporate Hamper', description: 'Office snacks and wine.', price: 60000, category: 'Food', tags: ['Corporate', 'Office event'], images: ['https://images.unsplash.com/photo-1595155829624-94943714b22c?w=500'], is_active: true, stock: 20 },
    { id: 'p10', name: 'Wedding Favors (Bulk)', description: '50pcs mini candles.', price: 75000, category: 'Decor', tags: ['Wedding', 'Church event'], images: ['https://images.unsplash.com/photo-1566679056673-9828d15f2178?w=500'], is_active: true, stock: 2 },
    // more products...
];

export const MOCK_BANNERS: Banner[] = [
    { id: 'b1', title: 'Valentine\'s Special', subtitle: 'Get 20% off red roses', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b9?w=800', link_target: 'Romance', is_active: true, sort_order: 1 },
    { id: 'b2', title: 'New Arrivals', subtitle: 'Check out our latest gifts', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800', link_target: 'new', is_active: true, sort_order: 2 },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ord-1001', user_id: 'u4', user_name: 'John Doe', total_amount: 45000, status: 'placed', created_at: '2023-06-01T10:00:00Z', shipping_address: '123 Lagos St', recipient_name: 'Jane Doe', recipient_phone: '1234567890',
        items: [{ product_id: 'p1', product_name: 'Luxury Rose Box', quantity: 1, price: 45000, image: MOCK_PRODUCTS[0].images[0] }],
        timeline: [{ status: 'placed', date: '2023-06-01T10:00:00Z' }]
    },
    {
        id: 'ord-1002', user_id: 'u5', user_name: 'Jane Smith', total_amount: 30000, status: 'processing', created_at: '2023-05-28T09:30:00Z', shipping_address: '456 Abuja Way', recipient_name: 'Baby Smith', recipient_phone: '0987654321',
        items: [{ product_id: 'p7', product_name: 'Baby Hamper', quantity: 1, price: 30000, image: MOCK_PRODUCTS[6].images[0] }],
        timeline: [{ status: 'placed', date: '2023-05-28T09:30:00Z' }, { status: 'confirmed', date: '2023-05-28T10:00:00Z' }, { status: 'processing', date: '2023-05-28T12:00:00Z' }]
    },
    {
        id: 'ord-1003', user_id: 'u4', user_name: 'John Doe', total_amount: 15000, status: 'delivered', created_at: '2023-05-20T14:00:00Z', shipping_address: '123 Lagos St', recipient_name: 'John Doe', recipient_phone: '1234567890',
        items: [{ product_id: 'p3', product_name: 'Gourmet Chocolate Set', quantity: 1, price: 15000, image: MOCK_PRODUCTS[2].images[0] }],
        timeline: [{ status: 'placed', date: '2023-05-20T14:00:00Z' }, { status: 'delivered', date: '2023-05-22T16:00:00Z' }]
    },
    // more orders...
];

export const MOCK_REQUESTS: CustomRequest[] = [
    { id: 'req-1', user_id: 'u4', user_name: 'John Doe', purpose: 'Wedding Anniversary', budget: '100000', description: 'I want a huge bouquet of 100 roses and a diamond necklace replica.', recipient_details: 'Wife', status: 'new', created_at: '2023-06-02T08:00:00Z' },
    { id: 'req-2', user_id: 'u5', user_name: 'Jane Smith', purpose: 'Corporate', budget: '500000', description: '50 gift bags for office party.', recipient_details: 'Staff', status: 'quoted', quote_amount: 480000, quote_message: 'We can do this with premium snacks.', created_at: '2023-06-01T11:00:00Z' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1', user_id: 'u4', user_name: 'John Doe', status: 'unassigned', last_message_at: '2023-06-02T10:30:00Z',
        messages: [
            { id: 'm1', sender_id: 'u4', text: 'My order is delayed, please help!', created_at: '2023-06-02T10:30:00Z' }
        ]
    },
    {
        id: 'conv-2', user_id: 'u5', user_name: 'Jane Smith', assigned_to: 'u2', status: 'assigned', last_message_at: '2023-06-02T11:15:00Z', related_order_id: 'ord-1002',
        messages: [
            { id: 'm1', sender_id: 'u5', text: 'Can I change the delivery address?', created_at: '2023-06-02T11:00:00Z' },
            { id: 'm2', sender_id: 'u2', text: 'Sure, what is the new address?', created_at: '2023-06-02T11:15:00Z' }
        ]
    }
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
    { id: 'evt-1', type: 'order_placed', description: 'Order #ord-1001 placed by John Doe', created_at: '2023-06-01T10:00:00Z' },
    { id: 'evt-2', type: 'request_submitted', description: 'New Custom Request from Jane Smith', created_at: '2023-06-01T11:00:00Z' },
    { id: 'evt-3', type: 'support_escalated', description: 'Chat escalated by John Doe', created_at: '2023-06-02T10:30:00Z' },
    { id: 'evt-4', type: 'order_updated', description: 'Order #ord-1002 status updated to Processing', performer_name: 'Sarah Support', created_at: '2023-05-28T12:00:00Z' },
];
