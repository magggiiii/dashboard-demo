"use client";

import React from 'react';
import { Visualization } from '@/types/schema';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { AreaChart } from './AreaChart';
import { PieChart } from './PieChart';
import { ScatterChart } from './ScatterChart';
import { RadarChart } from './RadarChart';
import { RadialBarChart } from './RadialBarChart';
import { TreemapChart } from './TreemapChart';
import { FunnelChart } from './FunnelChart';
import { SankeyChart } from './SankeyChart';
import { ComposedChart } from './ComposedChart';
import { ChartContainer } from './ChartContainer';

export const Chart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { chartType, title, description } = visualization;

    const renderChartContent = () => {
        switch (chartType) {
            case 'line':
                return <LineChart visualization={visualization} />;
            case 'bar':
                return <BarChart visualization={visualization} />;
            case 'area':
                return <AreaChart visualization={visualization} />;
            case 'pie':
                return <PieChart visualization={visualization} />;
            case 'scatter':
                return <ScatterChart visualization={visualization} />;
            case 'radar':
                return <RadarChart visualization={visualization} />;
            case 'radialbar':
                return <RadialBarChart visualization={visualization} />;
            case 'treemap':
                return <TreemapChart visualization={visualization} />;
            case 'funnel':
                return <FunnelChart visualization={visualization} />;
            case 'sankey':
                return <SankeyChart visualization={visualization} />;
            case 'composed':
                return <ComposedChart visualization={visualization} />;
            case 'histogram':
                return <BarChart visualization={visualization} />;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Unsupported chart type: {chartType}
                    </div>
                );
        }
    };

    return (
        <ChartContainer title={title} description={description ?? undefined}>
            {renderChartContent()}
        </ChartContainer>
    );
};
