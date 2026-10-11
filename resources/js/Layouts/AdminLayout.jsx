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
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function AdminLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: 'Dashboard Analitik',
            href: route('admin.dashboard'),
            icon: LayoutDashboard,
            current: route().current('admin.dashboard'),
        },
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
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand / Logo Header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/20">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                TRACER STUDY
                            </span>
                            <span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Administrator MA
                            </span>
                        </div>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-700 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </Button>
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
                                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${item.current ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Profile with Shadcn Avatar & Button */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs font-bold bg-emerald-700 text-white">
                                    {user?.name?.charAt(0) || 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    {user?.name}
                                </p>
                                <p className="truncate text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                    Ustadz / Admin
                                </p>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                title="Keluar dari Admin"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden h-9 w-9 text-slate-600"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        {header && (
                            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
                                {header}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="emerald" className="hidden sm:inline-flex gap-1.5 py-1">
                            <Shield className="h-3 w-3" />
                            Mode Administrator
                        </Badge>
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Link href={route('dashboard')}>
                                <span>Lihat Portal Santri</span>
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Flash status messages with Shadcn Alert */}
                {flash?.status && (
                    <div className="mx-4 mt-4 sm:mx-8">
                        <Alert variant="emerald">
                            <AlertDescription>{flash.status}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
