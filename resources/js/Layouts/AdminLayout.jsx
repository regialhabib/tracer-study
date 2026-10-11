import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Newspaper,
    Shield,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: LayoutDashboard,
            current: route().current('admin.dashboard'),
        },
        // Route placeholder untuk tahap berikutnya
        {
            name: 'Kuesioner Builder',
            href: '#',
            icon: ClipboardList,
            current: false,
        },
        {
            name: 'Data Alumni & Import',
            href: '#',
            icon: Users,
            current: false,
        },
        {
            name: 'Berita & Agenda',
            href: '#',
            icon: Newspaper,
            current: false,
        },
        {
            name: 'Pesan & Konsultasi',
            href: '#',
            icon: MessageSquare,
            current: false,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand / Logo Header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-900 leading-tight">
                                Tracer Study MA
                            </span>
                            <span className="block text-[10px] font-medium text-emerald-700">
                                Portal Administrator
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 space-y-1.5 px-3 py-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                                    item.current
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${item.current ? 'text-emerald-700' : 'text-slate-400'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-900">
                                    {user?.name}
                                </p>
                                <p className="truncate text-[10px] text-emerald-700 font-medium">
                                    Ustadz / Admin
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Keluar"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        {header && (
                            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                                {header}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 sm:flex">
                            <Shield className="h-3 w-3" />
                            Admin Mode
                        </span>
                        <Link
                            href={route('dashboard')}
                            className="text-xs font-medium text-slate-500 hover:text-emerald-700"
                        >
                            Lihat Dashboard Santri &rarr;
                        </Link>
                    </div>
                </header>

                {/* Flash status messages */}
                {flash?.status && (
                    <div className="mx-4 mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 sm:mx-8">
                        {flash.status}
                    </div>
                )}

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
