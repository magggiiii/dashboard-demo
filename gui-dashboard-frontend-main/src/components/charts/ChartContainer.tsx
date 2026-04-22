"use client";

import React from 'react';

interface ChartContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, description, children }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 h-[420px] card-hover flex flex-col justify-between">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
                {description && <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>}
            </div>
            <div className="w-full flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
};
