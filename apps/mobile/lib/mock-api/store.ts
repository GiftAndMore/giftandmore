import {
    User, Product, Order, Banner, CustomRequest, Conversation, ActivityEvent, OrderStatus, ActivityType
} from './types';
import {
    MOCK_USERS, MOCK_PRODUCTS, MOCK_BANNERS, MOCK_ORDERS, MOCK_REQUESTS, MOCK_CONVERSATIONS, MOCK_ACTIVITY
} from './data';

// Simple in-memory store
class MockStore {
    users = [...MOCK_USERS];
    products = [...MOCK_PRODUCTS];
    banners = [...MOCK_BANNERS];
    orders = [...MOCK_ORDERS];
    requests = [...MOCK_REQUESTS];
    conversations = [...MOCK_CONVERSATIONS];
    activity = [...MOCK_ACTIVITY];

    private delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- USERS ---
    async getUsers() { await this.delay(); return this.users; }
    async getUser(id: string) { await this.delay(); return this.users.find(u => u.id === id); }
    async updateUser(id: string, updates: Partial<User>) {
        await this.delay();
        this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
        return this.users.find(u => u.id === id);
    }
    async deleteUser(id: string) {
        await this.delay();
        const user = this.users.find(u => u.id === id);
        this.users = this.users.filter(u => u.id !== id);
        if (user?.role === 'assistant') {
            this.logActivity('assistant_deleted', `Assistant ${user.full_name} deleted`);
        } else {
            this.logActivity('user_banned', `User ${id} deleted/banned`);
        }
    }

    async createAssistant(data: { email: string; full_name: string; tasks: string[] }) {
        await this.delay();
        const newUser: User = {
            id: `asst-${Date.now()}`,
            email: data.email,
            full_name: data.full_name,
            role: 'assistant',
            is_banned: false,
            created_at: new Date().toISOString(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=8B5CF6&color=fff`,
            assistant_tasks: data.tasks as any[],
            assistant_status: 'offline',
            assistant_enabled: true
        };
        this.users.unshift(newUser);
        this.logActivity('assistant_created', `Assistant ${data.full_name} created`);
        return newUser;
    }

    async toggleAssistantStatus(id: string, enabled: boolean) {
        await this.delay();
        this.users = this.users.map(u => u.id === id ? { ...u, assistant_enabled: enabled } : u);
        const user = this.users.find(u => u.id === id);
        this.logActivity('assistant_updated', `Assistant ${user?.full_name} ${enabled ? 'enabled' : 'disabled'}`);
    }

    async resetPassword(id: string) {
        await this.delay();
        const newPassword = Math.random().toString(36).slice(-8);
        const user = this.users.find(u => u.id === id);
        this.logActivity('password_reset', `Password reset for ${user?.full_name}`);
        return newPassword;
    }

    // --- PRODUCTS ---
    async getProducts() { await this.delay(); return this.products; }
    async getProduct(id: string) { await this.delay(); return this.products.find(p => p.id === id); }
    async createProduct(product: Omit<Product, 'id'>) {
        await this.delay();
        const newProduct = { ...product, id: `p${Date.now()}` };
        this.products.push(newProduct);
        this.logActivity('product_created', `Product ${newProduct.name} created`);
        return newProduct;
    }
    async updateProduct(id: string, updates: Partial<Product>) {
        await this.delay();
        this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p);
        const updated = this.products.find(p => p.id === id);
        if (updated) this.logActivity('product_updated', `Product ${updated.name} updated`);
        return updated;
    }
    async deleteProduct(id: string) {
        await this.delay();
        this.products = this.products.filter(p => p.id !== id);
    }

    // --- ORDERS ---
    async getOrders() { await this.delay(); return this.orders; }
    async getOrder(id: string) { await this.delay(); return this.orders.find(o => o.id === id); }
    async updateOrderStatus(id: string, status: OrderStatus, note?: string) {
        await this.delay();
        this.orders = this.orders.map(o => {
            if (o.id === id) {
                const timeline = [...o.timeline, { status, date: new Date().toISOString(), note }];
                return { ...o, status, timeline };
            }
            return o;
        });
        this.logActivity('order_updated', `Order ${id} updated to ${status}`);
        return this.orders.find(o => o.id === id);
    }

    // --- REQUESTS ---
    async getRequests() { await this.delay(); return this.requests; }
    async updateRequestStatus(id: string, status: CustomRequest['status'], quote?: { amount: number, message: string }) {
        await this.delay();
        this.requests = this.requests.map(r => {
            if (r.id === id) {
                return {
                    ...r,
                    status,
                    quote_amount: quote?.amount ?? r.quote_amount,
                    quote_message: quote?.message ?? r.quote_message
                };
            }
            return r;
        });
    }

    // --- BANNERS ---
    async getBanners() { await this.delay(); return this.banners; }
    async createBanner(banner: Omit<Banner, 'id'>) {
        await this.delay();
        const newBanner = { ...banner, id: `b${Date.now()}` };
        this.banners.push(newBanner);
        this.logActivity('banner_updated', `Banner ${newBanner.title} created`);
        return newBanner;
    }
    async deleteBanner(id: string) {
        await this.delay();
        this.banners = this.banners.filter(b => b.id !== id);
    }
    async updateBanner(id: string, updates: Partial<Banner>) {
        await this.delay();
        this.banners = this.banners.map(b => b.id === id ? { ...b, ...updates } : b);
        const updated = this.banners.find(b => b.id === id);
        if (updated) this.logActivity('banner_updated', `Banner ${updated.title} updated`);
        return updated;
    }

    // --- CONVERSATIONS ---
    async getConversations() { await this.delay(); return this.conversations; }
    async getConversation(id: string) { await this.delay(); return this.conversations.find(c => c.id === id); }
    async updateConversation(id: string, updates: Partial<Conversation>) {
        await this.delay();
        this.conversations = this.conversations.map(c => c.id === id ? { ...c, ...updates } : c);
        const updated = this.conversations.find(c => c.id === id);
        if (updated) this.logActivity('support_escalated', `Conversation ${id} updated`);
        return updated;
    }
    async addMessage(conversationId: string, text: string, senderId: string) {
        await this.delay();
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            const newMessage = {
                id: `msg-${Date.now()}`,
                sender_id: senderId,
                text,
                created_at: new Date().toISOString()
            };
            conversation.messages.push(newMessage);
            conversation.last_message_at = newMessage.created_at;
            this.logActivity('support_escalated', `New message in conv ${conversationId}`);
            return newMessage;
        }
    }

    // --- ACTIVITY ---
    async getActivity() { await this.delay(); return this.activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); }

    private logActivity(type: ActivityType, description: string) {
        this.activity.unshift({
            id: `evt-${Date.now()}`,
            type,
            description,
            created_at: new Date().toISOString(),
            performer_name: 'Admin'
        });
    }

    // --- KPIS ---
    async getKPIs() {
        await this.delay();
        return {
            totalOrders: this.orders.length,
            pendingEscalations: this.conversations.filter(c => c.status === 'unassigned').length,
            revenue: this.orders.reduce((sum, o) => sum + o.total_amount, 0),
            activeUsers: this.users.length, // Simplified
            pendingRequests: this.requests.filter(r => r.status === 'new').length,
            totalBanners: this.banners.length
        };
    }
}

export const mockStore = new MockStore();
