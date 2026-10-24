import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button, Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui';
import { STATUS_ACTIONS } from './statusActions';

/** Dialog konfirmasi perubahan status. `target` = status tujuan atau null (tertutup). */
export default function StatusChangeDialog({ kuesioner, target, onClose }) {
    const [processing, setProcessing] = useState(false);
    const action = target ? STATUS_ACTIONS[target] : null;

    const confirm = () => {
        router.patch(
            route('admin.kuesioner.status', kuesioner.id),
            { status: target },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    onClose();
                },
            },
        );
    };

    return (
        <Dialog open={Boolean(kuesioner && action)} onClose={onClose}>
            <DialogHeader>
                <DialogTitle>{action?.title}</DialogTitle>
                <DialogDescription>
                    <span className="font-medium text-foreground">{kuesioner?.title}</span>
                    <br />
                    {action?.description}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button type="button" loading={processing} loadingText="Memproses…" onClick={confirm}>
                    {action?.label}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
