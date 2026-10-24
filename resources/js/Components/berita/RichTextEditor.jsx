import { useEffect } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Underline,
    Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Menormalkan URL tautan: tanpa skema → https://. Hanya http, https, mailto yang lolos.
 * Mengembalikan null bila tidak valid.
 */
function normalizeLinkUrl(raw) {
    const value = (raw ?? '').trim();

    if (value === '') {
        return null;
    }

    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;

    return /^(https?:\/\/|mailto:)/i.test(candidate) ? candidate : null;
}

function ToolbarButton({ label, onClick, active = false, disabled = false, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 md:size-9 [&_svg]:size-4',
                active && 'bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary',
            )}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <span aria-hidden="true" className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block" />;
}

/**
 * RichTextEditor — editor teks kaya (Tiptap) yang menghasilkan HTML sesuai whitelist berita:
 * p, br, h2, h3, strong, em, u, s, a, ul, ol, li, blockquote, hr.
 *
 * Props:
 * - `id`        id elemen area ketik (untuk `<Label htmlFor>`).
 * - `value`     string HTML.
 * - `onChange`  `(html) => void`; mengirim '' bila editor kosong.
 * - `placeholder`
 * - `invalid`   tandai error (batas danger + aria-invalid).
 * - `aria-describedby` id pesan error/hint.
 */
export default function RichTextEditor({
    id,
    value = '',
    onChange,
    placeholder = 'Tulis isi di sini…',
    invalid = false,
    'aria-describedby': ariaDescribedBy,
    className,
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                code: false,
                codeBlock: false,
                link: {
                    openOnClick: false,
                    autolink: false,
                    protocols: ['http', 'https', 'mailto'],
                    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
                },
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                ...(id ? { id } : {}),
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-label': 'Isi',
                ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
                ...(invalid ? { 'aria-invalid': 'true' } : {}),
                class: 'rich-content rich-editor-content',
            },
        },
        onUpdate: ({ editor: current }) => {
            onChange?.(current.isEmpty ? '' : current.getHTML());
        },
    });

    // Sinkronkan perubahan nilai dari luar (mis. reset form) tanpa menimpa ketikan aktif.
    useEffect(() => {
        if (!editor || editor.isFocused) {
            return;
        }

        const current = editor.isEmpty ? '' : editor.getHTML();

        if ((value || '') !== current) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [value, editor]);

    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => {
            if (!current) {
                return null;
            }

            return {
                bold: current.isActive('bold'),
                italic: current.isActive('italic'),
                underline: current.isActive('underline'),
                strike: current.isActive('strike'),
                h2: current.isActive('heading', { level: 2 }),
                h3: current.isActive('heading', { level: 3 }),
                bulletList: current.isActive('bulletList'),
                orderedList: current.isActive('orderedList'),
                blockquote: current.isActive('blockquote'),
                link: current.isActive('link'),
                canUndo: current.can().undo(),
                canRedo: current.can().redo(),
            };
        },
    });

    if (!editor || !state) {
        return (
            <div
                aria-hidden="true"
                className={cn('min-h-[16rem] rounded-md border border-input bg-card', invalid && 'border-danger', className)}
            />
        );
    }

    const handleLink = () => {
        const previous = editor.getAttributes('link').href ?? '';
        const input = window.prompt('Masukkan alamat tautan (http, https, atau mailto):', previous);

        if (input === null) {
            return;
        }

        if (input.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        const href = normalizeLinkUrl(input);

        if (href === null) {
            window.alert('Alamat tautan tidak valid. Gunakan awalan http://, https://, atau mailto:.');

            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    };

    const chain = () => editor.chain().focus();

    return (
        <div
            className={cn(
                'rounded-md border bg-card transition-colors duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
                invalid ? 'border-danger' : 'border-input',
                className,
            )}
        >
            <div role="toolbar" aria-label="Format teks" className="flex flex-wrap items-center gap-0.5 border-b border-border p-1">
                <ToolbarButton label="Tebal" active={state.bold} onClick={() => chain().toggleBold().run()}>
                    <Bold aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Miring" active={state.italic} onClick={() => chain().toggleItalic().run()}>
                    <Italic aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Garis bawah" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
                    <Underline aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Coret" active={state.strike} onClick={() => chain().toggleStrike().run()}>
                    <Strikethrough aria-hidden="true" />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton label="Judul 2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
                    <Heading2 aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Judul 3" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
                    <Heading3 aria-hidden="true" />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton label="Daftar berbutir" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
                    <List aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Daftar bernomor" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
                    <ListOrdered aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Kutipan" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
                    <Quote aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Garis pemisah" onClick={() => chain().setHorizontalRule().run()}>
                    <Minus aria-hidden="true" />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton label="Sisipkan tautan" active={state.link} onClick={handleLink}>
                    <Link2 aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                    label="Hapus tautan"
                    disabled={!state.link}
                    onClick={() => chain().extendMarkRange('link').unsetLink().run()}
                >
                    <Link2Off aria-hidden="true" />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton label="Urungkan" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
                    <Undo2 aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Ulangi" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
                    <Redo2 aria-hidden="true" />
                </ToolbarButton>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
