'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import { supabase } from '@packages/supabase';

export default function NewProductPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // 1. Insert Product
        const { error } = await supabase.from('products').insert({
            name,
            description,
            price: parseFloat(price),
            stock: 100 // Default stock
        });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard/products');
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        required
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Product'}
                </button>
            </form>
        </div>
    );
}
