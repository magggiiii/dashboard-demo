"use client";

import React, { useState } from 'react';
import { ChevronDown, FileType } from 'lucide-react';

interface SpreadsheetPreviewProps {
    data: Record<string, unknown>[];
    onDataUpdate?: (newData: Record<string, unknown>[]) => void;
    limit?: number;
}

export const SpreadsheetPreview: React.FC<SpreadsheetPreviewProps> = ({
    data,
    onDataUpdate,
    limit: initialLimit = 50
}) => {
    const [previewLimit, setPreviewLimit] = useState(initialLimit);
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleCellClick = (rowIndex: number, columnKey: string, currentValue: unknown) => {
        setEditingCell({ rowIndex, columnKey });
        setEditValue(String(currentValue));
    };

    const handleSaveEdit = () => {
        if (!editingCell || !onDataUpdate) return;

        const newData = [...data];
        newData[editingCell.rowIndex] = {
            ...newData[editingCell.rowIndex],
            [editingCell.columnKey]: editValue
        };
        onDataUpdate(newData);
        setEditingCell(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <FileType className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No data available to preview.</p>
            </div>
        );
    }

    const headers = Object.keys(data[0]).filter(k => k !== 'id');

    return (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-[13px] border-separate border-spacing-0">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-50/90 backdrop-blur-sm">
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50/100 last:border-r-0 whitespace-nowrap min-w-[120px]"
                                >
                                    {header.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.slice(0, previewLimit).map((row, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors group">
                                {headers.map((key, cellIdx) => {
                                    const value = row[key];
                                    const isEditing = editingCell?.rowIndex === idx && editingCell?.columnKey === key;

                                    return (
                                        <td
                                            key={cellIdx}
                                            className={`
                                                px-4 py-2 text-slate-600 border-r border-slate-100 last:border-r-0 truncate max-w-[200px] cursor-text transition-all
                                                ${isEditing ? 'bg-white p-0 overflow-visible z-10' : ''}
                                            `}
                                            title={!isEditing ? String(value) : undefined}
                                            onClick={() => !isEditing && handleCellClick(idx, key, value)}
                                        >
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    className="w-full h-full px-4 py-2 border-2 border-indigo-500 outline-none shadow-sm rounded-sm text-slate-900 bg-white"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={handleSaveEdit}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            ) : (
                                                String(value)
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <p className="text-[11px] font-medium text-slate-500">
                    Showing {Math.min(previewLimit, data.length)} of {data.length.toLocaleString()} records
                </p>
                {data.length > previewLimit && (
                    <button
                        onClick={() => setPreviewLimit(prev => prev + 50)}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Load More <ChevronDown className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};
