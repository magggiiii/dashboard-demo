"use client";

import React from 'react';
import { RadialBarChart as RechartsRadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/constants';

export const RadialBarChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    // Transform data for RadialBar chart - each series becomes a separate radial bar
    const transformedData = config.series.map((seriesKey, index) => {
        // Calculate the value from the data
        const value = data.reduce((sum, item) => {
            const val = typeof item[seriesKey] === 'number' ? item[seriesKey] : 0;
            return sum + val;
        }, 0);

        return {
            name: seriesKey,
            value: value,
            fill: config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length],
        };
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsRadialBarChart
                innerRadius="10%"
                outerRadius="90%"
                data={transformedData}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis type="number" domain={[0, 'auto']} angleAxisId={0} tick={false} />
                <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 14 }}
                />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />}
            </RechartsRadialBarChart>
        </ResponsiveContainer>
    );
};
