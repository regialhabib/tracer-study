export default function ApplicationLogo({ className = 'h-10 w-auto', ...props }) {
    return (
        <img
            src="/images/logo.webp"
            alt="Pondok Pesantren RIYADHUL AMIEN"
            className={className}
            {...props}
        />
    );
}
