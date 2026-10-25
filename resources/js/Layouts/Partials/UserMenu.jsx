import { usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui';
import { initialsFromName } from './navigation';

/**
 * UserMenu — tombol avatar + menu akun di top bar.
 *
 * `children` berisi `DropdownMenuItem` khusus tiap layout; kepala menu (nama + NISN/email)
 * disediakan otomatis dari `auth.user`.
 */
export default function UserMenu({ children }) {
    const user = usePage().props.auth?.user;

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Menu akun ${user.name}`}
                className="inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:pr-2.5"
            >
                <Avatar className="size-8">
                    {user.avatar_src && <AvatarImage src={user.avatar_src} alt="" />}
                    <AvatarFallback className="text-xs">{initialsFromName(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-foreground sm:block">
                    {user.name}
                </span>
                <ChevronDown aria-hidden="true" className="hidden size-4 text-muted-foreground sm:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60">
                <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    {user.nisn ? (
                        <p className="truncate font-mono text-xs text-muted-foreground">NISN {user.nisn}</p>
                    ) : (
                        user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    )}
                </div>
                <DropdownMenuSeparator />
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
