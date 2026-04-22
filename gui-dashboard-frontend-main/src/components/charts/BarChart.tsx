"use client";

import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_STYLE, GRID_STROKE } from '@/lib/constants';

export const BarChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey={config.xAxis} axisLine={false} tickLine={false} tick={AXIS_STYLE} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: '#f1f5f9' }}
                />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {config.series.map((key, index) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[6, 6, 0, 0]}
                        stackId={config.stacked ? 'stack' : undefined}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};
