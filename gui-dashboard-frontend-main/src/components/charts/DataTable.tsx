import React from 'react';
import { Table } from '@/types/schema';

export const DataTable: React.FC<{ table: Table }> = ({ table }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 h-[420px] card-hover flex flex-col justify-between">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{table.title}</h3>
                {table.description && <p className="text-sm text-slate-500 font-medium mt-1">{table.description}</p>}
            </div>
            <div className="w-full flex-1 min-h-0 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {table.columns.map((col) => (
                                <th key={col.key} className="pb-4 px-4 first:pl-2">{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-slate-600 text-sm">
                        {table.data.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group">
                                {table.columns.map((col) => (
                                    <td key={col.key} className="py-4 px-4 first:pl-2 group-hover:text-slate-900 transition-colors font-medium">{String(row[col.key])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
