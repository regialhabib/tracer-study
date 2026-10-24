<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ubah isi teks polos lama menjadi HTML `<p>` per paragraf.
     */
    public function up(): void
    {
        DB::table('berita')->orderBy('id')->each(function (object $row): void {
            $content = (string) $row->content;

            if ($content === '' || $content !== strip_tags($content)) {
                return;
            }

            $paragraphs = preg_split('/\R{2,}/u', trim($content)) ?: [];
            $html = collect($paragraphs)
                ->map(fn (string $paragraph) => trim($paragraph))
                ->filter()
                ->map(fn (string $paragraph) => '<p>'.nl2br(e($paragraph), false).'</p>')
                ->implode('');

            DB::table('berita')->where('id', $row->id)->update(['content' => $html]);
        });
    }

    public function down(): void
    {
        //
    }
};
