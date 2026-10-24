import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

/**
 * BrandLogo — logo resmi + nama aplikasi, dipakai di top bar, sidebar, dan footer.
 *
 * Props:
 * - `href`      tujuan tautan (default "/"). `null` = tanpa tautan.
 * - `title`     teks utama (default "Tracer Alumni").
 * - `subtitle`  teks kecil di bawahnya (default "PP Riyadhul Amien").
 * - `size`      sm (32px) | md (36px, default) | lg (40px).
 */
const logoSizes = {
    sm: 'size-8',
    md: 'size-9',
    lg: 'size-10',
};

export default function BrandLogo({
    href = '/',
    title = 'Tracer Alumni',
    subtitle = 'PP Riyadhul Amien',
    size = 'md',
    className,
}) {
    const content = (
        <>
            <img
                src="/images/logo.webp"
                alt=""
                aria-hidden="true"
                className={cn('shrink-0 object-contain', logoSizes[size] ?? logoSizes.md)}
            />
            <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold leading-tight tracking-tight text-foreground">
                    {title}
                </span>
                {subtitle && (
                    <span className="truncate text-xs font-medium text-muted-foreground">
                        {subtitle}
                    </span>
                )}
            </span>
        </>
    );

    const classes = cn('flex min-w-0 items-center gap-2.5', className);

    if (href === null) {
        return <div className={classes}>{content}</div>;
    }

    return (
        <Link
            href={href}
            className={cn(
                classes,
                'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
        >
            {content}
        </Link>
    );
}
