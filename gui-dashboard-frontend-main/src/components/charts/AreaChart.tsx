"use client";

import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_STYLE, GRID_STROKE } from '@/lib/constants';

export const AreaChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={data}>
                <defs>
                    {config.series.map((key, index) => (
                        <linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey={config.xAxis} axisLine={false} tickLine={false} tick={AXIS_STYLE} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {config.series.map((key, index) => (
                    <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                        fill={`url(#gradient-${key})`}
                        strokeWidth={2}
                        stackId={config.stacked ? 'stack' : undefined}
                    />
                ))}
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
};
