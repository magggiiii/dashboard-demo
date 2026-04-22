"use client";

import React from 'react';
import { Treemap as RechartsTreemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/constants';

export const TreemapChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    // Transform data for Treemap - expects hierarchical structure with name, size, and children
    const transformedData = data.map((item, index) => ({
        name: item[config.xAxis] || `Item ${index + 1}`,
        size: config.series.reduce((sum, key) => {
            const val = typeof item[key] === 'number' ? item[key] : 0;
            return sum + val;
        }, 0),
        fill: config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length],
    }));

    const CustomContent = (props: any) => {
        const { x, y, width, height, name, size, fill } = props;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill,
                        stroke: '#fff',
                        strokeWidth: 2,
                    }}
                />
                {width > 50 && height > 30 && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 - 7}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                            fontWeight="bold"
                        >
                            {name}
                        </text>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={10}
                        >
                            {size}
                        </text>
                    </>
                )}
            </g>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsTreemap
                data={transformedData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomContent />}
            >
                <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RechartsTreemap>
        </ResponsiveContainer>
    );
};
