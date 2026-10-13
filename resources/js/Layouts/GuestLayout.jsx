import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-500 selection:text-white">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <Link href="/" className="group flex items-center gap-3">
                        <img
                            src="/images/logo.webp"
                            alt="Logo Pondok Pesantren RIYADHUL AMIEN"
                            className="h-14 w-14 object-contain group-hover:scale-105 transition-all drop-shadow-sm"
                        />
                        <div className="text-left">
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                                TRACER STUDY
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase">
                                PP RIYADHUL AMIEN
                            </span>
                        </div>
                    </Link>
                </div>

                {children}

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    &copy; {new Date().getFullYear()} Tracer Study &bull; Pondok Pesantren RIYADHUL AMIEN
                </p>
            </div>
        </div>
    );
}
