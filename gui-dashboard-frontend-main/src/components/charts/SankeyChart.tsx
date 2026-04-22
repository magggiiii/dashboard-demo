"use client";

import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { Visualization } from '@/types/schema';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/constants';

export const SankeyChart: React.FC<{ visualization: Visualization }> = ({ visualization }) => {
    const { data, config } = visualization;

    // Transform data for Sankey - expects nodes and links structure
    // For simplicity, we'll create a flow from xAxis values to series values
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeMap = new Map<string, number>();

    // Create nodes from unique xAxis values
    data.forEach((item) => {
        const name = String(item[config.xAxis]);
        if (!nodeMap.has(name)) {
            nodeMap.set(name, nodes.length);
            nodes.push({ name });
        }
    });

    // Create nodes from series keys
    config.series.forEach((seriesKey) => {
        if (!nodeMap.has(seriesKey)) {
            nodeMap.set(seriesKey, nodes.length);
            nodes.push({ name: seriesKey });
        }
    });

    // Create links from data
    data.forEach((item) => {
        const sourceName = String(item[config.xAxis]);
        const sourceIndex = nodeMap.get(sourceName);

        config.series.forEach((seriesKey) => {
            const value = typeof item[seriesKey] === 'number' ? item[seriesKey] : 0;
            if (value > 0) {
                const targetIndex = nodeMap.get(seriesKey);
                links.push({
                    source: sourceIndex,
                    target: targetIndex,
                    value: value,
                });
            }
        });
    });

    const sankeyData = {
        nodes,
        links,
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <Sankey
                data={sankeyData}
                node={{ fill: CHART_COLORS[0], fillOpacity: 0.8 }}
                link={{ stroke: '#77c878', strokeOpacity: 0.3 }}
                nodePadding={50}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
                <Tooltip contentStyle={TOOLTIP_STYLE} />
            </Sankey>
        </ResponsiveContainer>
    );
};
