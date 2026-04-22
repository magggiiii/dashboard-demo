"use client";

import React from 'react';
import { ComposedChart as RechartsComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_STYLE, GRID_STROKE } from '@/lib/constants';

export const ComposedChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    // For ComposedChart, we'll render the first series as a Bar, second as a Line, and third as an Area
    // This provides a good default mixed visualization
    const renderSeries = (seriesKey: string, index: number) => {
        const color = config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length];

        // Cycle through different chart types
        const chartType = index % 3;

        switch (chartType) {
            case 0:
                return (
                    <Bar
                        key={seriesKey}
                        dataKey={seriesKey}
                        fill={color}
                        radius={[6, 6, 0, 0]}
                    />
                );
            case 1:
                return (
                    <Line
                        key={seriesKey}
                        type="monotone"
                        dataKey={seriesKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                );
            case 2:
                return (
                    <Area
                        key={seriesKey}
                        type="monotone"
                        dataKey={seriesKey}
                        fill={color}
                        stroke={color}
                        fillOpacity={0.6}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey={config.xAxis} axisLine={false} tickLine={false} tick={AXIS_STYLE} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: '#f1f5f9' }}
                />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {config.series.map((key, index) => renderSeries(key, index))}
            </RechartsComposedChart>
        </ResponsiveContainer>
    );
};
