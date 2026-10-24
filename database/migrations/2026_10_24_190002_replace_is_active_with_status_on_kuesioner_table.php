<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kuesioner', function (Blueprint $table) {
            $table->string('status', 20)->default('draft')->after('end_date')->index();
        });

        DB::table('kuesioner')->where('is_active', true)->update(['status' => 'active']);
        DB::table('kuesioner')->where('is_active', false)->update(['status' => 'closed']);

        Schema::table('kuesioner', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kuesioner', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('end_date');
        });

        DB::table('kuesioner')->update(['is_active' => false]);
        DB::table('kuesioner')->where('status', 'active')->update(['is_active' => true]);

        Schema::table('kuesioner', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
        });
    }
};
