import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/Components/ui/alert';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function FirstLogin({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('first-login.update'));
    };

    return (
        <GuestLayout>
            <Head title="Aktivasi Akun Santri - First Login" />

            <Card className="shadow-lg border-slate-200/80 dark:border-slate-800">
                <CardHeader className="space-y-1 text-center pb-4">
                    <div className="flex justify-center mb-1">
                        <Badge variant="emerald" className="gap-1 px-3 py-1 text-xs">
                            <Sparkles className="h-3 w-3" /> Aktivasi Akun Baru
                        </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Ahlan wa Sahlan, {user.name}!
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                        Mohon lengkapi email aktif dan password baru untuk mengamankan akun alumni Anda
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert variant="emerald" className="py-3">
                        <KeyRound className="h-4 w-4" />
                        <AlertTitle className="text-xs font-semibold">Data Kelulusan Santri</AlertTitle>
                        <AlertDescription className="text-xs text-emerald-800/90 dark:text-emerald-300">
                            NISN: <span className="font-mono font-bold">{user.nisn}</span> &bull; Jurusan: <span className="font-semibold">{user.profile?.major || '-'}</span>
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Alamat Email Aktif</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="alumni@contoh.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone_number">Nomor WhatsApp Aktif</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                name="phone_number"
                                value={data.phone_number}
                                placeholder="Contoh: 081234567890"
                                onChange={(e) => setData('phone_number', e.target.value)}
                            />
                            {errors.phone_number && (
                                <p className="text-xs text-red-600 font-medium">{errors.phone_number}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password Baru Pribadi</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="Minimal 8 karakter"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && (
                                <p className="text-xs text-red-600 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation">Ulangi Password Baru</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                placeholder="Ketik ulang password baru Anda"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            {errors.password_confirmation && (
                                <p className="text-xs text-red-600 font-medium">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-md shadow-emerald-700/20"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            {processing ? 'Menyimpan Akun...' : 'Simpan & Lanjut ke Dashboard'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
