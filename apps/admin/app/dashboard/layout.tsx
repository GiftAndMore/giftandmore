import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-6">Gift App Admin</h2>
                <nav className="space-y-2">
                    <Link href="/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link>
                    <Link href="/dashboard/products" className="block p-2 hover:bg-gray-700 rounded">Products</Link>
                    <Link href="/dashboard/orders" className="block p-2 hover:bg-gray-700 rounded">Orders</Link>
                    <Link href="/" className="block p-2 hover:bg-gray-700 rounded text-red-300 mt-10">Logout</Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
