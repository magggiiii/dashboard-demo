"use client";

import React from 'react';
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_STYLE } from '@/lib/constants';

export const RadarChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey={config.xAxis} tick={AXIS_STYLE} />
                <PolarRadiusAxis axisLine={false} tick={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {config.series.map((key, index) => (
                    <Radar
                        key={key}
                        name={key}
                        dataKey={key}
                        stroke={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                        fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                        fillOpacity={0.6}
                    />
                ))}
            </RechartsRadarChart>
        </ResponsiveContainer>
    );
};
