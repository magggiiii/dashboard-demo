"use client";

import React from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/constants';

export const FunnelChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    // Transform data for Funnel chart
    const transformedData = data.map((item, index) => ({
        name: item[config.xAxis] || `Stage ${index + 1}`,
        value: config.series.reduce((sum, key) => {
            const val = typeof item[key] === 'number' ? item[key] : 0;
            return sum + val;
        }, 0),
        fill: config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length],
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsFunnelChart>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Funnel
                    dataKey="value"
                    data={transformedData}
                    isAnimationActive
                >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                </Funnel>
            </RechartsFunnelChart>
        </ResponsiveContainer>
    );
};
