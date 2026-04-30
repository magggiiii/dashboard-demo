import React from 'react';
import { Table } from '@/types/schema';

export const DataTable: React.FC<{ table: Table }> = ({ table }) => {
    return (
        <div className="ui-panel-v2 motion-panel p-4 md:p-5 rounded-2xl shadow-sm h-[420px] card-hover flex flex-col justify-between">
            <div className="mb-6">
                <h3 className="text-base md:text-lg font-bold tracking-tight">{table.title}</h3>
                {table.description && <p className="text-xs md:text-sm ui-muted-v2 font-medium mt-1">{table.description}</p>}
            </div>
            <div className="w-full flex-1 min-h-0 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                        <tr className="border-b border-[var(--ui-border)] ui-muted-v2 text-[11px] font-semibold uppercase tracking-wider">
                            {table.columns.map((col) => (
                                <th key={col.key} className="pb-4 px-4 first:pl-2">{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {table.data.map((row, i) => (
                            <tr key={i} className="border-b border-slate-100/70 last:border-0 hover:bg-[var(--ui-surface-2)] transition-colors group">
                                {table.columns.map((col) => (
                                    <td key={col.key} className="py-3 px-3 first:pl-2 group-hover:text-[var(--ui-text-1)] transition-colors font-medium">{String(row[col.key])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
