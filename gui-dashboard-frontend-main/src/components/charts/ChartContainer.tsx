"use client";

import React from 'react';

interface ChartContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, description, children }) => {
    return (
        <div className="ui-panel-v2 motion-panel p-4 md:p-5 rounded-2xl shadow-sm h-[420px] card-hover flex flex-col justify-between">
            <div className="mb-6">
                <h3 className="text-base md:text-lg font-bold tracking-tight">{title}</h3>
                {description && <p className="text-xs md:text-sm ui-muted-v2 font-medium mt-1">{description}</p>}
            </div>
            <div className="w-full flex-1 min-h-[300px]">
                {children}
            </div>
        </div>
    );
};
