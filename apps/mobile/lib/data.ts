export interface Product {
    id: string;
    title: string;
    category: string;
    price: number;
    gender: 'Male' | 'Female' | 'Unisex';
    description: string;
    media: { type: 'image' | 'video'; url: string }[];
    colors: string[];
    sizes: string[];
}

const CATEGORIES = ["Wedding", "Birthday", "Valentine", "Anniversary", "Celebration", "Baby", "Thank You", "Baby Shower"];
const GENDERS = ["Male", "Female", "Unisex"] as const;

// Titles per category for variance
const TITLES: Record<string, string[]> = {
    Wedding: ["Luxury Bedding Set", "Couple Robes", "Crystal Toasting Flutes", "Dinner Plate Set", "Custom Photo Frame", "Honeymoon Travel Kit", "Mr & Mrs Towels", "Wedding Cake Knife", "Keepsake Box", "Elegant Candle Set", "Formal Wedding Shoes", "Designer Wedding Trousers"],
    Birthday: ["Gaming Headset", "Smart Watch Series 9", "Designer Handbag", "Premium Cologne", "Running Sneakers", "Birthday Party Pack", "Wireless Earbuds", "Leather Jacket", "Makeup Box Set", "Personalized Mug", "Slim Fit Jeans", "Casual Leather Shoes"],
    Valentine: ["Giant Teddy Bear", "Red Rose Bouquet", "Chocolate Heart Box", "Luxury Spa Voucher", "Gold Necklace", "Couple Bracelets", "Romantic Dinner Set", "Love Letter Scroll", "Perfume Gift Set", "Date Night Box", "Red Velvet Dress", "Silk Trousers"],
    Anniversary: ["Anniversary Plaque", "Couple Watches", "Vintage Wine Set", "Photo Album", "Engraved Jewelry", "Weekend Getaway Voucher", "Matching T-Shirts", "Home Decor Statue", "Silver Picture Frame", "Love Keychains", "Leather Boots", "Tailored Pants"],
    Celebration: ["Champagne Bottle", "Gourmet Hamper", "Party Speaker", "Confetti Cannons", "Celebration Cake", "Balloon Arch Kit", "Cocktail Shaker Set", "Cheese Board", "BBQ Grill Set", "Karaoke Machine", "Party Dress Shoes", "Chino Pants"],
    Baby: ["Baby Onesie Set", "Soft Plush Toy", "Baby Blanket", "Teething Ring Set", "Nursery Lamp", "Baby Walker", "Bath Toy Set", "Musical Mobile", "Baby Monitor", "Stroller Organizer", "Baby Denim Jeans", "Crib Shoes", "Tiny Trousers"],
    "Thank You": ["Thank You Card & Pen", "Scented Candle", "Box of Chocolates", "Potted Plant", "Gourmet Cookies", "Fruit Basket", "Coffee Mug", "Desk Organizer", "Premium Tea Set", "Relaxation Kit", "Comfortable Loafers", "Smart Canvas Trousers"],
    "Baby Shower": ["Diaper Cake", "Baby Bottle Set", "Maternity Pillow", "Baby Clothes Hamper", "Digital Thermometer", "Changing Mat", "Baby Care Kit", "Keepsake Handprint", "Nursery Wall Art", "Feeding Chair", "Newborn Booties", "Baby Jogger Pants"]
};

// Colors & Sizes
const COLORS = ["Red", "Blue", "Black", "White", "Gold", "Silver", "Pink", "Green"];
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const NUMERIC_SIZES = Array.from({ length: 32 }, (_, i) => (i + 15).toString()); // 15 to 46
const BABY_SIZES = ["0-1 Year", "1-2 Years", "2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years"];

const getSizesForTitle = (title: string, category: string): string[] => {
    const t = title.toLowerCase();
    const c = category.toLowerCase();

    // Baby category gets priority for age-based sizes
    if (c.includes("baby")) {
        // Only apply baby sizes if it's actually something wearable
        if (t.includes("shirt") || t.includes("onesie") || t.includes("clothes") || t.includes("shoe") || t.includes("bootie") || t.includes("pant") || t.includes("trouser") || t.includes("jean") || t.includes("jogger")) {
            return BABY_SIZES;
        }
    }

    if (t.includes("shirt") || t.includes("robe") || t.includes("jacket") || t.includes("onesie") || t.includes("clothes") || t.includes("bedding") || t.includes("dress")) {
        return CLOTHING_SIZES;
    }
    if (t.includes("pant") || t.includes("trouser") || t.includes("jean") || t.includes("shoe") || t.includes("sneaker") || t.includes("boot") || t.includes("loafer") || t.includes("chino")) {
        return NUMERIC_SIZES;
    }
    return ["Free Size"];
};

// Helper to generate distinct products
const generateProducts = (): Product[] => {
    const products: Product[] = [];
    let idCounter = 1;

    CATEGORIES.forEach(category => {
        const titles = TITLES[category] || ["Gift Item"];

        // Generate 42 items per category (6 rows of 7 in grid, theoretically)
        for (let i = 0; i < 42; i++) {
            const baseTitle = titles[i % titles.length];
            const variant = Math.floor(i / titles.length) + 1;
            const fullTitle = variant > 1 ? `${baseTitle} (Ver. ${variant})` : baseTitle;

            // Random attributes
            const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
            const price = Math.floor(Math.random() * (150000 - 5000 + 1) + 5000); // 5k - 150k

            // Context aware sizes
            const availableSizes = getSizesForTitle(fullTitle, category);
            const isNumeric = availableSizes === NUMERIC_SIZES;

            const selectedSizes = availableSizes.length > 5
                ? availableSizes.sort(() => 0.5 - Math.random()).slice(0, 5).sort((a, b) => isNumeric ? parseInt(a) - parseInt(b) : 0)
                : availableSizes;

            products.push({
                id: idCounter.toString(),
                title: fullTitle,
                category,
                price,
                gender: category === "Baby" || category === "Baby Shower" ? "Unisex" : gender, // Force unisex for babies mostly
                description: `This huge ${fullTitle} is perfect for the ${category} occasion! Handpicked with love and wrapped for premium presentation. Guaranteed to bring a smile.`,
                media: [
                    { type: 'image', url: `https://via.placeholder.com/400?text=${encodeURIComponent(fullTitle)}+1` },
                    { type: 'image', url: `https://via.placeholder.com/400/0000FF/808080?text=${encodeURIComponent(fullTitle)}+2` },
                    { type: 'image', url: `https://via.placeholder.com/400/FF0000/FFFFFF?text=${encodeURIComponent(fullTitle)}+3` },
                    ...(Math.random() > 0.7 ? [{ type: 'video' as const, url: "https://www.w3schools.com/html/mov_bbb.mp4" }] : [])
                ],
                colors: COLORS.sort(() => 0.5 - Math.random()).slice(0, 3),
                sizes: selectedSizes
            });
            idCounter++;
        }
    });

    return products;
};

export const ALL_PRODUCTS = generateProducts();

export const getProductById = (id: string): Product | undefined => {
    return ALL_PRODUCTS.find(p => p.id === id);
};
