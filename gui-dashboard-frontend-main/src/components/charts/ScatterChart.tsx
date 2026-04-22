"use client";

import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_STYLE, GRID_STROKE } from '@/lib/constants';

export const ScatterChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsScatterChart>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis type="number" dataKey={config.xAxis} name={config.xAxis} axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <YAxis type="number" dataKey={config.yAxis || config.series[0]} name={config.yAxis || config.series[0]} axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ strokeDasharray: '3 3' }}
                />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {config.series.map((key, index) => (
                    <Scatter
                        key={key}
                        name={key}
                        data={data}
                        fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                    />
                ))}
            </RechartsScatterChart>
        </ResponsiveContainer>
    );
};
