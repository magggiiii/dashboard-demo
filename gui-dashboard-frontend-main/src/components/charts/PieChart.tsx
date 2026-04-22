"use client";

import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/constants';

export const PieChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    // For PieChart, we usually take the first series as the values and the xAxis as the labels.
    const dataKey = config.series[0];
    const nameKey = config.xAxis;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    label
                >
                    {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            </RechartsPieChart>
        </ResponsiveContainer>
    );
};
