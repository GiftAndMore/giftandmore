import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    User, Product, Order, Banner, CustomRequest, Conversation, ActivityEvent, OrderStatus, ActivityType, ProductSubmission, BannerSubmission, AssistantActivityLog
} from './types';
import {
    MOCK_USERS, MOCK_PRODUCTS, MOCK_BANNERS, MOCK_ORDERS, MOCK_REQUESTS, MOCK_CONVERSATIONS, MOCK_ACTIVITY
} from './data';

const STORAGE_KEYS = {
    USERS: 'mock_users',
    PRODUCTS: 'mock_products',
    BANNERS: 'mock_banners',
    ORDERS: 'mock_orders',
    REQUESTS: 'mock_requests',
    CONVERSATIONS: 'mock_conversations',
    ACTIVITY: 'mock_activity',
    PRODUCT_SUBMISSIONS: 'mock_product_submissions',
    BANNER_SUBMISSIONS: 'mock_banner_submissions',
    PASSWORDS: 'mock_passwords'
};

// Simple in-memory store with persistence
class MockStore {
    users: User[] = [...MOCK_USERS];
    passwords: Record<string, string> = {
        'u1': 'Admin',
        'u2': 'pass123',
        'u3': 'pass123',
        'u_test_va': 'Assistance'
    };
    products: Product[] = [...MOCK_PRODUCTS];
    banners: Banner[] = [...MOCK_BANNERS];
    orders: Order[] = [...MOCK_ORDERS];
    requests: CustomRequest[] = [...MOCK_REQUESTS];
    conversations: Conversation[] = [...MOCK_CONVERSATIONS];
    activity: ActivityEvent[] = [...MOCK_ACTIVITY];
    productSubmissions: ProductSubmission[] = [];
    bannerSubmissions: BannerSubmission[] = [];

    private initialized = false;
    private initPromise: Promise<void> | null = null;

    private async ensureInitialized() {
        if (this.initialized) return;
        if (!this.initPromise) {
            this.initPromise = this.loadFromStorage();
        }
        await this.initPromise;
    }

    private async loadFromStorage() {
        try {
            const [u, pwd, p, b, o, r, c, a, ps, bs] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.USERS),
                AsyncStorage.getItem(STORAGE_KEYS.PASSWORDS),
                AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
                AsyncStorage.getItem(STORAGE_KEYS.BANNERS),
                AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
                AsyncStorage.getItem(STORAGE_KEYS.REQUESTS),
                AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS),
                AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY),
                AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_SUBMISSIONS),
                AsyncStorage.getItem(STORAGE_KEYS.BANNER_SUBMISSIONS),
            ]);

            if (u) {
                this.users = JSON.parse(u);

                // FORCE SYNC CRITICAL USERS (Admin, Assistants)
                // This prevents "Invalid credentials" if local storage has stale/corrupted data
                const criticalUserIds = ['u1', 'u2', 'u3', 'u_test_va'];

                criticalUserIds.forEach(id => {
                    const mockUser = MOCK_USERS.find(user => user.id === id);
                    if (mockUser) {
                        const existingIndex = this.users.findIndex(user => user.id === id);
                        if (existingIndex !== -1) {
                            // Update existing
                            this.users[existingIndex] = { ...this.users[existingIndex], ...mockUser };
                        } else {
                            // Re-add missing
                            this.users.push(mockUser);
                        }
                    }
                });

                // CLEANUP DUPLICATES
                // Remove any users that have the same email as a critical user but a different ID
                this.users = this.users.filter(u => {
                    const criticalUser = MOCK_USERS.find(cu => cu.email.toLowerCase() === u.email.toLowerCase());
                    if (criticalUser && criticalUser.id !== u.id) {
                        return false; // Remove duplicate that doesn't match the critical ID
                    }
                    return true;
                });

                // Persist the fixed user list
                this.save(STORAGE_KEYS.USERS, this.users);
            }
            if (pwd) {
                this.passwords = JSON.parse(pwd);
                // FORCE SYNC DEFAULT PASSWORDS
                // This ensures we can always log in with default accounts even if storage is old
                this.passwords['u1'] = 'Admin';
                this.passwords['u2'] = 'pass123';
                this.passwords['u3'] = 'pass123';
                this.passwords['u_test_va'] = 'Assistance';
                this.passwords['u4'] = 'password';
                this.passwords['u5'] = 'password';

                // Persist the fixed passwords
                this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
            }
            if (p) {
                this.products = JSON.parse(p);
                // FORCE SYNC BABY HAMPER FOR DEBUGGING (Sales Price)
                const babyHamperIndex = this.products.findIndex(pr => pr.id === 'p7');
                const mockBabyHamper = MOCK_PRODUCTS.find(pr => pr.id === 'p7');
                if (babyHamperIndex !== -1 && mockBabyHamper) {
                    this.products[babyHamperIndex] = mockBabyHamper;
                }
            }
            if (b) this.banners = JSON.parse(b);
            if (o) {
                this.orders = JSON.parse(o);
                // INJECT NEW MOCK ORDER IF MISSING
                const newOrder = MOCK_ORDERS.find(mo => mo.id === 'ord-1004');
                if (newOrder && !this.orders.find(ord => ord.id === 'ord-1004')) {
                    this.orders.unshift(newOrder); // Add to top
                }
            }
            if (r) {
                this.requests = JSON.parse(r);
                // INJECT NEW MOCK REQUEST IF MISSING
                const newReq = MOCK_REQUESTS.find(mr => mr.id === 'req-3');
                if (newReq && !this.requests.find(req => req.id === 'req-3')) {
                    this.requests.unshift(newReq); // Add to top
                }
            }
            if (c) {
                this.conversations = JSON.parse(c);
                // Sanitize messages to fix potential data corruption (e.g. text being an object)
                this.conversations.forEach(conv => {
                    if (conv.messages) {
                        conv.messages = conv.messages.map(msg => {
                            let text = msg.text;
                            // Check if text is actually an object (the specific error case reported)
                            if (typeof text === 'object' && text !== null) {
                                // If it has a 'text' property, use that
                                if ((text as any).text) text = (text as any).text;
                                // Fallback to stringifying if still object
                                else text = JSON.stringify(text);
                            }

                            // Fix camelCase keys if present (legacy data support)
                            const sender_id = msg.sender_id || (msg as any).senderId || 'unknown';

                            return {
                                ...msg,
                                text: String(text), // Ensure it's a primitive string
                                sender_id
                            };
                        });
                    }
                });
            }
            if (a) this.activity = JSON.parse(a);
            if (ps) this.productSubmissions = JSON.parse(ps);
            if (bs) this.bannerSubmissions = JSON.parse(bs);
        } catch (e) {
            console.error('Failed to load mock data', e);
        } finally {
            this.initialized = true;
        }
    }

    private async save(key: string, data: any) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Failed to save ${key}`, e);
        }
    }

    private delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- AUTH HELPERS ---
    async verifyCredentials(email: string, password: string): Promise<User | null> {
        await this.ensureInitialized();
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return null;

        const storedPass = this.passwords[user.id];
        if (storedPass === password) return user;
        if (!storedPass && password === 'password') return user; // Default fallback

        return null;
    }

    // --- USERS ---
    async getUsers() { await this.ensureInitialized(); return this.users; }

    async getUser(id: string) { await this.ensureInitialized(); return this.users.find(u => u.id === id); }

    async getUserPixel(email: string) { // Helper for auth
        await this.ensureInitialized();
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    async updateUser(id: string, updates: Partial<User>) {
        await this.ensureInitialized();
        this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
        await this.save(STORAGE_KEYS.USERS, this.users);
        return this.users.find(u => u.id === id);
    }

    async deleteUser(id: string) {
        await this.ensureInitialized();
        const user = this.users.find(u => u.id === id);
        this.users = this.users.filter(u => u.id !== id);
        delete this.passwords[id];
        await this.save(STORAGE_KEYS.USERS, this.users);
        await this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
        if (user?.role === 'assistant') {
            await this.logActivity('assistant_deleted', `Assistant ${user.full_name} deleted`);
        }
    }

    async createAssistant(data: { email: string; full_name: string; tasks: string[]; password?: string }) {
        await this.ensureInitialized();
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

        if (data.password) {
            this.passwords[newUser.id] = data.password;
            await this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
        }

        await this.save(STORAGE_KEYS.USERS, this.users);
        await this.logActivity('assistant_created', `Assistant ${data.full_name} created`);
        return newUser;
    }

    async toggleAssistantStatus(id: string, enabled: boolean) {
        await this.ensureInitialized();
        this.users = this.users.map(u => u.id === id ? { ...u, assistant_enabled: enabled } : u);
        await this.save(STORAGE_KEYS.USERS, this.users);
        const user = this.users.find(u => u.id === id);
        this.logActivity('assistant_updated', `Assistant ${user?.full_name} ${enabled ? 'enabled' : 'disabled'}`);
    }

    async setAvailability(id: string, status: 'online' | 'busy' | 'offline') {
        await this.ensureInitialized();
        this.users = this.users.map(u => u.id === id ? { ...u, assistant_status: status, last_active: new Date().toISOString() } : u);
        await this.save(STORAGE_KEYS.USERS, this.users);
    }

    async getAssistants() {
        await this.ensureInitialized();
        return this.users.filter(u => u.role === 'assistant');
    }

    async getOnlineAssistantCount() {
        await this.ensureInitialized();
        const assistants = this.users.filter(u => u.role === 'assistant');
        const online = assistants.filter(u => u.assistant_status === 'online');
        return { online: online.length, total: assistants.length };
    }

    async logAssistantActivity(id: string, action: string, details: string) {
        await this.ensureInitialized();
        const user = this.users.find(u => u.id === id);
        if (user) {
            const log: AssistantActivityLog = {
                id: `alog-${Date.now()}`,
                action,
                details,
                timestamp: new Date().toISOString()
            };
            if (!user.activity_log) user.activity_log = [];
            user.activity_log.unshift(log);
            user.last_active = log.timestamp;
            await this.save(STORAGE_KEYS.USERS, this.users);
        }
    }

    async resetPassword(id: string) {
        await this.ensureInitialized();
        const newPassword = Math.random().toString(36).slice(-8);
        return newPassword;
    }

    async createUser(data: { email: string; password: string; full_name: string; username: string }) {
        await this.ensureInitialized();
        // Check if user already exists
        if (this.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            throw new Error('User already exists');
        }

        const newUser: User = {
            id: `u-${Date.now()}`,
            email: data.email,
            full_name: data.full_name,
            user_metadata: {
                full_name: data.full_name,
                username: data.username
            },
            role: 'user',
            created_at: new Date().toISOString(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=random`,
            is_banned: false
        };

        this.users.push(newUser);
        this.passwords[newUser.id] = data.password;

        await this.save(STORAGE_KEYS.USERS, this.users);
        await this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
        this.logActivity('user_signup', `User ${data.full_name} signed up`);

        return newUser;
    }

    // --- PRODUCTS ---
    async getProducts() { await this.ensureInitialized(); return this.products; }

    async getProduct(id: string) { await this.ensureInitialized(); return this.products.find(p => p.id === id); }

    async createProduct(product: Omit<Product, 'id'>) {
        await this.ensureInitialized();
        const newProduct = { ...product, id: `p${Date.now()}` };
        this.products.push(newProduct);
        await this.save(STORAGE_KEYS.PRODUCTS, this.products);
        this.logActivity('product_created', `Product ${newProduct.name} created`);
        return newProduct;
    }

    async updateProduct(id: string, updates: Partial<Product>) {
        await this.ensureInitialized();
        this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p);
        await this.save(STORAGE_KEYS.PRODUCTS, this.products);
        return this.products.find(p => p.id === id);
    }

    async deleteProduct(id: string) {
        await this.ensureInitialized();
        this.products = this.products.filter(p => p.id !== id);
        await this.save(STORAGE_KEYS.PRODUCTS, this.products);
    }

    async createProductSubmission(submission: Omit<ProductSubmission, 'id' | 'created_at' | 'status'>) {
        await this.ensureInitialized();
        const newSub: ProductSubmission = {
            id: `psubh-${Date.now()}`,
            ...submission,
            status: 'submitted',
            created_at: new Date().toISOString()
        };
        this.productSubmissions.push(newSub);
        await this.save(STORAGE_KEYS.PRODUCT_SUBMISSIONS, this.productSubmissions);
        return newSub;
    }

    // --- ORDERS ---
    async getOrders() { await this.ensureInitialized(); return this.orders; }

    async getOrder(id: string) { await this.ensureInitialized(); return this.orders.find(o => o.id === id); }

    async getAssignedOrders(assistantId: string) {
        // Mock logic: return orders "assigned" or just all for now, maybe filter by some logic if needed
        await this.ensureInitialized();
        // For now preventing full access unless specified?
        // Let's just return all orders but maybe filtered later.
        // For MVP mock, return all orders to assistant with 'update_orders' permission.
        return this.orders;
    }

    async updateOrderStatus(id: string, status: OrderStatus, note?: string) {
        await this.ensureInitialized();
        this.orders = this.orders.map(o => {
            if (o.id === id) {
                const timeline = [...o.timeline, { status, date: new Date().toISOString(), note }];
                return { ...o, status, timeline };
            }
            return o;
        });
        await this.save(STORAGE_KEYS.ORDERS, this.orders);
        this.logActivity('order_updated', `Order ${id} updated to ${status}`);
        return this.orders.find(o => o.id === id);
    }

    // --- REQUESTS ---
    async getRequests() { await this.ensureInitialized(); return this.requests; }

    async getAssignedRequests(assistantId: string) {
        await this.ensureInitialized();
        return this.requests; // Return all for now
    }

    async updateRequestStatus(id: string, status: CustomRequest['status'], quote?: { amount: number, message: string }) {
        await this.ensureInitialized();
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
        await this.save(STORAGE_KEYS.REQUESTS, this.requests);
    }

    // --- BANNERS ---
    async getBanners() { await this.ensureInitialized(); return this.banners; }

    async getBanner(id: string) { await this.ensureInitialized(); return this.banners.find(b => b.id === id); }

    async createBanner(banner: Omit<Banner, 'id'>) {
        await this.ensureInitialized();
        const newBanner = { ...banner, id: `b${Date.now()}` };
        this.banners.push(newBanner);
        await this.save(STORAGE_KEYS.BANNERS, this.banners);
        return newBanner;
    }

    async updateBanner(id: string, updates: Partial<Banner>) {
        await this.ensureInitialized();
        this.banners = this.banners.map(b => b.id === id ? { ...b, ...updates } : b);
        await this.save(STORAGE_KEYS.BANNERS, this.banners);
        this.logActivity('banner_updated', `Banner ${id} updated`);
        return this.banners.find(b => b.id === id);
    }

    async deleteBanner(id: string) {
        await this.ensureInitialized();
        this.banners = this.banners.filter(b => b.id !== id);
        await this.save(STORAGE_KEYS.BANNERS, this.banners);
        this.logActivity('banner_updated', `Banner ${id} deleted`);
    }

    // --- CONVERSATIONS ---
    async getConversations() { await this.ensureInitialized(); return this.conversations; }

    async getConversation(id: string) { await this.ensureInitialized(); return this.conversations.find(c => c.id === id); }

    async getAssignedConversations(assistantId: string) {
        await this.ensureInitialized();
        return this.conversations.filter(c => c.assigned_to === assistantId);
    }

    async getUnassignedConversations() {
        await this.ensureInitialized();
        return this.conversations.filter(c => c.status === 'unassigned');
    }

    async joinConversation(conversationId: string, assistantId: string) {
        await this.ensureInitialized();
        this.conversations = this.conversations.map(c =>
            c.id === conversationId ? { ...c, assigned_to: assistantId, status: 'assigned' } : c
        );
        await this.save(STORAGE_KEYS.CONVERSATIONS, this.conversations);
    }

    async updateConversation(id: string, updates: Partial<Conversation>) {
        await this.ensureInitialized();
        this.conversations = this.conversations.map(c => c.id === id ? { ...c, ...updates } : c);
        await this.save(STORAGE_KEYS.CONVERSATIONS, this.conversations);
        return this.conversations.find(c => c.id === id);
    }

    async createConversation(data: Partial<Conversation>) {
        await this.ensureInitialized();
        const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            user_id: data.user_id || 'unknown',
            title: data.title || 'Support Chat',
            status: data.status || 'unassigned',
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            messages: [],
            ...data
        };
        this.conversations.unshift(newConv);
        await this.save(STORAGE_KEYS.CONVERSATIONS, this.conversations);
        return newConv;
    }

    async addMessage(conversationId: string, text: string, senderId: string) {
        await this.ensureInitialized();
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
            await this.save(STORAGE_KEYS.CONVERSATIONS, this.conversations);
            return newMessage;
        }
    }

    // --- ACTIVITY ---
    async getActivity() { await this.ensureInitialized(); return this.activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); }

    private async logActivity(type: ActivityType, description: string) {
        this.activity.unshift({
            id: `evt-${Date.now()}`,
            type,
            description,
            created_at: new Date().toISOString(),
            performer_name: 'Admin' // Should ideally pass user name
        });
        await this.save(STORAGE_KEYS.ACTIVITY, this.activity);
    }

    // --- KPIS ---
    async getKPIs() {
        await this.ensureInitialized();
        const assistants = this.users.filter(u => u.role === 'assistant');
        return {
            totalOrders: this.orders.length,
            pendingEscalations: this.conversations.filter(c => c.status === 'unassigned').length,
            revenue: this.orders.reduce((sum, o) => sum + o.total_amount, 0),
            activeUsers: this.users.length,
            pendingRequests: this.requests.filter(r => r.status === 'new' || r.status === 'in_review').length,
            totalBanners: this.banners.length,
            onlineAssistants: assistants.filter(u => u.assistant_status === 'online').length,
            totalAssistants: assistants.length
        };
    }
}

export const mockStore = new MockStore();
