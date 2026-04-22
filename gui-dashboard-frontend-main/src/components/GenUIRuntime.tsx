"use client";

import React from 'react';
import { UIElementSchema, UIElement } from '@/types/schema';
import { Chart } from './charts/Chart';
import { MetricCard } from './charts/MetricCard';
import { DataTable } from './charts/DataTable';
import { AlertCircle } from 'lucide-react';

interface GenUIRuntimeProps {
    data: any;
}

export const GenUIRuntime: React.FC<GenUIRuntimeProps> = ({ data }) => {
    // Validate data with Zod
    const result = UIElementSchema.safeParse(data);

    if (!result.success) {
        console.error('GenUI Validation Error:', result.error);
        return (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">UI Rendering Error</h4>
                    <p className="text-xs opacity-80">The provided UI schema is invalid or incomplete.</p>
                </div>
            </div>
        );
    }

    const validatedData = result.data;

    switch (validatedData.type) {
        case 'chart':
            return <Chart visualization={validatedData} />;
        case 'metric':
            return <MetricCard metric={validatedData} />;
        case 'table':
            return <DataTable table={validatedData} />;
        default:
            return null;
    }
};
