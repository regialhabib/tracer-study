import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, AlertDescription, PageHeader } from '@/Components/ui';
import ImportStepper from '@/Components/admin/import/ImportStepper';
import UploadStep from '@/Components/admin/import/UploadStep';
import PreviewStep from '@/Components/admin/import/PreviewStep';
import ResultStep from '@/Components/admin/import/ResultStep';

export default function Import({ step, preview, result, limits }) {
    const { errors } = usePage().props;

    return (
        <AdminLayout
            title="Import Alumni"
            header={
                <PageHeader
                    title="Import Data Alumni"
                    description="Tambahkan banyak alumni sekaligus dari berkas Excel atau CSV."
                />
            }
        >
            <Head title="Import Alumni" />

            <div className="space-y-4 md:space-y-6">
                <ImportStepper current={step} />

                {step === 'upload' && (
                    <>
                        {errors?.token && (
                            <Alert variant="warning">
                                <AlertDescription>{errors.token}</AlertDescription>
                            </Alert>
                        )}
                        <UploadStep limits={limits} />
                    </>
                )}
                {step === 'preview' && preview && <PreviewStep key={preview.token} preview={preview} errors={errors} />}
                {step === 'result' && result && <ResultStep result={result} />}
            </div>
        </AdminLayout>
    );
}
