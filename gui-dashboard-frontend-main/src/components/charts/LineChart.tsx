"use client";

import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_STYLE, GRID_STROKE } from '@/lib/constants';

export const LineChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey={config.xAxis} axisLine={false} tickLine={false} tick={AXIS_STYLE} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {config.series.map((key, index) => (
                    <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#fff', stroke: config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};
