import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui';

/**
 * Tabel data sederhana untuk mode "Lihat tabel".
 *
 * Props:
 * - `columns` [{ header, render(row), numeric? }]
 * - `rows`
 * - `caption` teks untuk pembaca layar.
 */
export default function SimpleTable({ columns, rows, caption }) {
    return (
        <Table containerClassName="rounded-md border border-border">
            {caption && <caption className="sr-only">{caption}</caption>}
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead key={column.header} numeric={column.numeric}>
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow key={index}>
                        {columns.map((column, columnIndex) => (
                            <TableCell
                                key={column.header}
                                numeric={column.numeric}
                                className={columnIndex === 0 ? 'font-medium' : undefined}
                            >
                                {column.render(row)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
