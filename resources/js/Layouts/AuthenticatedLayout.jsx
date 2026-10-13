import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, Shield, User, LogOut, Menu, X, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground flex flex-col font-sans">
            {/* Main Navigation Bar */}
            <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 dark:bg-card/90 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3 group">
                                <img
                                    src="/images/logo.webp"
                                    alt="Logo PP RIYADHUL AMIEN"
                                    className="h-10 w-10 object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                                        Tracer Alumni
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold">
                                            Santri
                                        </span>
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        PP RIYADHUL AMIEN
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden space-x-2 sm:flex items-center h-16">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="h-full"
                                >
                                    Dashboard
                                </NavLink>

                                {user.role === 'admin' && (
                                    <NavLink
                                        href={route('admin.dashboard')}
                                        active={route().current('admin.dashboard')}
                                        className="h-full"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <Shield className="h-4 w-4 text-emerald-600" />
                                            Panel Pengelola
                                        </span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            {user.nisn && (
                                <div className="hidden lg:flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full text-xs text-slate-600 dark:text-slate-300">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">NISN</span>
                                    <span className="font-mono font-medium">{user.nisn}</span>
                                </div>
                            )}

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        <Avatar className="h-6 w-6 rounded-full border border-emerald-500/30">
                                            <AvatarFallback className="text-[10px] bg-emerald-600 text-white font-semibold">
                                                {(user?.name || 'A').charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold max-w-[120px] truncate">{user?.name || 'Alumni'}</span>
                                        <ChevronDown className="h-3 w-3 text-slate-400" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Pengaturan Profil & Sandi
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Keluar Akun
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="h-9 w-9 text-muted-foreground"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div className="border-t border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 sm:hidden shadow-xl shadow-slate-900/10 animate-in slide-in-from-top-2 duration-200">
                        {/* Navigation Links */}
                        <div className="p-3 space-y-1">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard Alumni</span>
                            </ResponsiveNavLink>

                            {user.role === 'admin' && (
                                <ResponsiveNavLink
                                    href={route('admin.dashboard')}
                                    active={route().current('admin.dashboard')}
                                >
                                    <Shield className="h-4 w-4 text-emerald-600" />
                                    <span>Panel Pengelola (Admin)</span>
                                </ResponsiveNavLink>
                            )}

                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                active={route().current('profile.edit')}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Pengaturan Profil & Sandi</span>
                            </ResponsiveNavLink>
                        </div>

                        {/* Logout Section */}
                        <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Keluar Akun</span>
                            </ResponsiveNavLink>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="flex-1">{children}</main>
        </div>
    );
}
