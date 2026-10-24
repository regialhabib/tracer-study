<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan {{ $kuesioner->title }}</title>
    <style>
        @page { margin: 28px 36px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1f2937; }
        h1 { font-size: 15px; margin: 0 0 4px; }
        h2 { font-size: 12px; margin: 18px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #1f7a4d; color: #1f7a4d; }
        .kop { width: 100%; border-bottom: 2px solid #1f7a4d; padding-bottom: 8px; margin-bottom: 12px; }
        .kop td { vertical-align: middle; }
        .kop img { width: 54px; height: 54px; }
        .kop .nama { font-size: 16px; font-weight: bold; color: #1f7a4d; }
        .meta { margin: 0 0 4px; color: #4b5563; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 4px; }
        table.data th, table.data td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; }
        table.data th { background: #f3f4f6; }
        table.data .num { text-align: right; width: 60px; }
        .bar-wrap { background: #e5e7eb; height: 8px; width: 100%; }
        .bar { background: #1f7a4d; height: 8px; }
        .stat td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: center; width: 25%; }
        .stat .angka { font-size: 14px; font-weight: bold; }
        .kosong { color: #6b7280; font-style: italic; }
        .nobreak { page-break-inside: avoid; }
    </style>
</head>
<body>
@php
    $fmt = fn ($n) => number_format((float) $n, 1, ',', '.');
    $int = fn ($n) => number_format((int) $n, 0, ',', '.');
@endphp

<table class="kop">
    <tr>
        @if ($logo)
            <td style="width: 62px;"><img src="{{ $logo }}" alt="Logo"></td>
        @endif
        <td><div class="nama">Pondok Pesantren Riyadhul Amien</div></td>
    </tr>
</table>

<h1>Laporan Tracer Study: {{ $kuesioner->title }}</h1>
<p class="meta">Periode kuesioner: {{ $periode }}</p>
<p class="meta">Filter: {{ $filterLabels === [] ? 'Semua alumni' : implode('; ', $filterLabels) }}</p>
<p class="meta">Dicetak pada: {{ $tanggalCetak }}</p>

<h2>Ringkasan Response Rate</h2>
<table class="stat" style="width: 100%; border-collapse: collapse;">
    <tr>
        <td><div class="angka">{{ $int($summary['target_count']) }}</div>Alumni target</td>
        <td><div class="angka">{{ $int($summary['submitted_count']) }}</div>Sudah mengirim</td>
        <td><div class="angka">{{ $fmt($summary['response_rate']) }}%</div>Response rate</td>
        <td><div class="angka">{{ $int($summary['draft_count']) }}</div>Masih draf</td>
    </tr>
</table>

@if (count($perAngkatan) > 0)
    <table class="data nobreak">
        <thead>
        <tr><th style="width: 60px;">Angkatan</th><th class="num">Target</th><th class="num">Terkirim</th><th class="num">Rate</th><th></th></tr>
        </thead>
        <tbody>
        @foreach ($perAngkatan as $row)
            <tr>
                <td>{{ $row['angkatan'] }}</td>
                <td class="num">{{ $int($row['target']) }}</td>
                <td class="num">{{ $int($row['submitted']) }}</td>
                <td class="num">{{ $fmt($row['rate']) }}%</td>
                <td><div class="bar-wrap"><div class="bar" style="width: {{ min(100, max(0, (float) $row['rate'])) }}%;"></div></div></td>
            </tr>
        @endforeach
        </tbody>
    </table>
@else
    <p class="kosong">Belum ada data angkatan.</p>
@endif

@if ($statusDistribution !== null)
    <h2>Distribusi Status Kegiatan</h2>
    <table class="data nobreak">
        <thead><tr><th>Status</th><th class="num">Jumlah</th><th class="num">Persen</th><th></th></tr></thead>
        <tbody>
        @foreach ($statusDistribution as $row)
            <tr>
                <td>{{ $row['label'] }}</td>
                <td class="num">{{ $int($row['count']) }}</td>
                <td class="num">{{ $fmt($row['percent']) }}%</td>
                <td><div class="bar-wrap"><div class="bar" style="width: {{ min(100, max(0, (float) $row['percent'])) }}%;"></div></div></td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

@if ($masaTunggu !== null)
    <h2>Masa Tunggu Kerja</h2>
    @if ($masaTunggu['count'] > 0)
        <p class="meta">Responden: {{ $int($masaTunggu['count']) }} · Rata-rata: {{ $fmt($masaTunggu['mean']) }} bulan · Median: {{ $fmt($masaTunggu['median']) }} bulan</p>
        @php $maxCount = max(1, collect($masaTunggu['distribution'])->max('count')); @endphp
        <table class="data nobreak">
            <thead><tr><th>Rentang</th><th class="num">Jumlah</th><th></th></tr></thead>
            <tbody>
            @foreach ($masaTunggu['distribution'] as $row)
                <tr>
                    <td>{{ $row['label'] }}</td>
                    <td class="num">{{ $int($row['count']) }}</td>
                    <td><div class="bar-wrap"><div class="bar" style="width: {{ round($row['count'] / $maxCount * 100) }}%;"></div></div></td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @else
        <p class="kosong">Belum ada jawaban masa tunggu.</p>
    @endif
@endif

@if ($pendapatan !== null)
    <h2>Rentang Pendapatan</h2>
    <table class="data nobreak">
        <thead><tr><th>Rentang</th><th class="num">Jumlah</th><th class="num">Persen</th><th></th></tr></thead>
        <tbody>
        @foreach ($pendapatan as $row)
            <tr>
                <td>{{ $row['label'] }}</td>
                <td class="num">{{ $int($row['count']) }}</td>
                <td class="num">{{ $fmt($row['percent']) }}%</td>
                <td><div class="bar-wrap"><div class="bar" style="width: {{ min(100, max(0, (float) $row['percent'])) }}%;"></div></div></td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

@if ($topLembaga !== null)
    <h2>Kampus dan Tempat Kerja Terbanyak</h2>
    @if (count($topLembaga) > 0)
        @php $maxCount = max(1, collect($topLembaga)->max('count')); @endphp
        <table class="data nobreak">
            <thead><tr><th>Nama</th><th class="num">Jumlah</th><th></th></tr></thead>
            <tbody>
            @foreach ($topLembaga as $row)
                <tr>
                    <td>{{ $row['name'] }}</td>
                    <td class="num">{{ $int($row['count']) }}</td>
                    <td><div class="bar-wrap"><div class="bar" style="width: {{ round($row['count'] / $maxCount * 100) }}%;"></div></div></td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @else
        <p class="kosong">Belum ada jawaban.</p>
    @endif
@endif

@if ($relevansiIlmu !== null)
    <h2>Relevansi Ilmu Pesantren</h2>
    @if ($relevansiIlmu['count'] > 0)
        <p class="meta">Responden: {{ $int($relevansiIlmu['count']) }} · Rata-rata: {{ $fmt($relevansiIlmu['mean']) }} dari 5</p>
        @php $maxCount = max(1, collect($relevansiIlmu['distribution'])->max('count')); @endphp
        <table class="data nobreak">
            <thead><tr><th>Skor</th><th class="num">Jumlah</th><th></th></tr></thead>
            <tbody>
            @foreach ($relevansiIlmu['distribution'] as $row)
                <tr>
                    <td>{{ $row['score'] }}</td>
                    <td class="num">{{ $int($row['count']) }}</td>
                    <td><div class="bar-wrap"><div class="bar" style="width: {{ round($row['count'] / $maxCount * 100) }}%;"></div></div></td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @else
        <p class="kosong">Belum ada jawaban.</p>
    @endif
@endif
</body>
</html>
