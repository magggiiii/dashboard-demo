"use client";

import { useState, useCallback, useMemo } from 'react';
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { Dashboard, UIElement } from '@/types/schema';
import { aggregateData } from '@/utils/dashboard-utils';
import { dashboardApi, DashboardResponse, ConnectedSource } from '@/lib/dashboard';
import { safeJsonParse } from '@/utils/json-utils';

export interface UseDashboardProps {
    parsedData?: Record<string, unknown>[];
}

const parseBackendDashboard = (backendData: DashboardResponse): Dashboard => {
    let elements: UIElement[] = [];
    let layout: any[] | undefined;

    // Use elements from 'data' column if available
    if (backendData.data && Array.isArray(backendData.data.elements) && backendData.data.elements.length > 0) {
        elements = backendData.data.elements;
        layout = Array.isArray(backendData.data.layout) ? backendData.data.layout : undefined;
    }

    // Fallback to reconstructing from 'charts' relation if elements is still empty
    if (elements.length === 0 && backendData.charts && Array.isArray(backendData.charts)) {
        console.log('[useDashboard] Reconstructing elements from charts relation');
        for (const chart of backendData.charts) {
            try {
                const config = chart.config || {};

                if (chart.type === 'chart') {
                    elements.push({
                        id: chart.id,
                        type: 'chart',
                        chartType: (config.chartType as any) || 'bar',
                        title: chart.name || 'Untitled Chart',
                        description: config.description || '',
                        config: {
                            xAxis: config.xAxis || '',
                            series: Array.isArray(config.series) ? config.series : [],
                            colors: Array.isArray(config.colors) ? config.colors : [],
                            showLegend: config.showLegend ?? true,
                        },
                        data: Array.isArray(chart.data) ? chart.data : [],
                    } as UIElement);
                } else if (chart.type === 'metric') {
                    elements.push({
                        id: chart.id,
                        type: 'metric',
                        label: chart.name || 'Untitled Metric',
                        value: config.value !== undefined ? String(config.value) : '0',
                        change: config.change !== undefined ? Number(config.change) : undefined,
                        trend: (config.trend as any) || 'neutral',
                        description: config.description || '',
                    } as UIElement);
                } else if (chart.type === 'table') {
                    elements.push({
                        id: chart.id,
                        type: 'table',
                        title: chart.name || 'Untitled Table',
                        description: config.description || '',
                        columns: Array.isArray(config.columns) ? config.columns : [],
                        data: Array.isArray(chart.data) ? chart.data : [],
                    } as UIElement);
                }
            } catch (err) {
                console.error('[useDashboard] Failed to parse individual chart into element:', err, chart);
            }
        }
    }

    return {
        layout,
        elements,
    };
};

export const useDashboard = ({ parsedData: localData = [] }: UseDashboardProps = {}) => {
    const [dashboard, setDashboard] = useState<Dashboard>({ elements: [] });

    const updateDashboard = useCallback((action: string, element?: any, elementId?: string) => {
        setDashboard((prev) => {
            let newElements = [...prev.elements];

            if (action === 'clear') {
                return { elements: [] };
            } else if (action === 'add' && element) {
                // Deduplication logic: Check if an element with the same title and type already exists
                const existingIndex = newElements.findIndex(e =>
                    (e.id === element.id) ||
                    (e.type === element.type && (e as any).title === (element as any).title && (element as any).title !== undefined) ||
                    (e.type === 'metric' && (e as any).label === (element as any).label && (element as any).label !== undefined)
                );

                if (existingIndex !== -1) {
                    // Update existing element instead of adding duplicate
                    // CRITICAL: Preserve existing data if the new element doesn't provide it
                    const existingElement = newElements[existingIndex];
                    const newElementData = (element as any).data || [];
                    const mergedData = newElementData.length > 0 ? newElementData : (existingElement as any).data;

                    newElements[existingIndex] = {
                        ...existingElement,
                        ...element,
                        data: mergedData
                    };
                } else {
                    newElements.push(element as UIElement);
                }
            } else if (action === 'remove' && elementId) {
                newElements = newElements.filter(e => e.id !== elementId);
            } else if (action === 'update' && element && elementId) {
                newElements = newElements.map(e => e.id === elementId ? (element as UIElement) : e);
            }

            return { ...prev, elements: newElements };
        });
    }, []);

    const prepareElement = (args: any, data: any[]) => {
        const {
            action,
            elementId,
            elementType,
            elementTitle,
            elementDescription,
            chartType,
            configXAxis,
            configSeries,
            configColors,
            configShowLegend,
            metricValue,
            metricLabel,
            metricChange,
            metricTrend,
            tableColumns,
            aggregation,
            dataJson,
        } = args;

        let parsedData: any[] = [];
        if (Array.isArray(dataJson)) {
            parsedData = dataJson;
        } else if (typeof dataJson === 'string') {
            parsedData = safeJsonParse(dataJson, []);
        }

        if (parsedData.length === 0 && data && data.length > 0) {
            // FALLBACK to local data if AI didn't provide any or parsing failed
            parsedData = data;
        }

        // PREPARE AGGREGATION & DATA
        let effectiveAggregation = aggregation;
        const seriesArray = (configSeries as string || "").split(',').map(s => s.trim()).filter(Boolean);
        let effectiveSeriesArray = [...seriesArray];
        let effectiveXAxis = (configXAxis === 'none') ? undefined : configXAxis;
        const colorsArray = (configColors as string || "").split(',').map(c => c.trim()).filter(Boolean);

        // Smart lookup for table grouping key if aggregation is requested
        if (elementType === 'table' && effectiveAggregation && effectiveAggregation !== 'none' && !effectiveXAxis) {
            const firstTableCol = tableColumns?.split(',')[0]?.split(':')[0]?.trim();
            if (firstTableCol) {
                effectiveXAxis = firstTableCol;
                console.log(`useDashboard: Table aggregation detected without explicit X-Axis. Grouping by ${effectiveXAxis}`);
            }
        }

        // Helper to detect if a column is numeric
        const isNumeric = (col: string) => {
            if (parsedData.length === 0) return true;
            const sampleRow = parsedData[0];
            const val = sampleRow[col];
            if (val === undefined || val === null) return false;
            if (typeof val === 'number') return true;
            const parsed = parseFloat(String(val).replace(/[$,]/g, ''));
            return !isNaN(parsed);
        };

        const firstSeries = seriesArray[0];
        const isFirstSeriesNumeric = firstSeries ? isNumeric(firstSeries) : false;

        // Smart Fallbacks for Aggregation:
        // 1. If no aggregation, and it's a Pie chart or categorical series -> Count
        // 2. If 'sum'/'avg' requested on a categorical column -> Count
        const shouldDefaultToCount = firstSeries && (
            ((!aggregation || aggregation === 'none') && (
                (chartType === 'pie' && !isFirstSeriesNumeric) ||
                (effectiveXAxis === firstSeries) ||
                (!isFirstSeriesNumeric)
            )) ||
            ((aggregation === 'sum' || aggregation === 'avg') && !isFirstSeriesNumeric)
        );

        if (shouldDefaultToCount) {
            const originalCategory = firstSeries;
            if (!effectiveXAxis || effectiveXAxis === 'none') {
                effectiveXAxis = originalCategory;
            }
            effectiveAggregation = 'count';
            effectiveSeriesArray = [`${originalCategory}_count`];
            console.log(`useDashboard: Smart-fallback to 'count' because ${originalCategory} is categorical.`);
        } else if ((!aggregation || aggregation === 'none') && effectiveXAxis && seriesArray.length > 0 && isFirstSeriesNumeric) {
            // Default numeric series with an X-Axis to 'sum'
            effectiveAggregation = 'sum';
            console.log(`useDashboard: Auto-defaulting to 'sum' because series is numeric and X-Axis is present.`);
        }

        // Apply Aggregation if required
        const finalData = (effectiveAggregation && effectiveAggregation !== 'none') || (effectiveXAxis && elementType !== 'table')
            ? aggregateData(parsedData, effectiveXAxis as string, seriesArray, effectiveAggregation || 'none')
            : parsedData;

        let element: any;

        if (elementType === "chart") {
            element = {
                id: (action === 'add' || !elementId)
                    ? (elementId || `chart-${(elementTitle || 'new').toLowerCase().replace(/\s+/g, '-')}`)
                    : elementId,
                type: "chart",
                chartType: chartType || "bar",
                title: elementTitle || "New Chart",
                description: elementDescription || "",
                config: {
                    xAxis: effectiveXAxis || "",
                    series: effectiveSeriesArray,
                    colors: colorsArray,
                    showLegend: configShowLegend ?? true,
                },
                data: finalData,
            };
        } else if (elementType === "table") {
            element = {
                id: (action === 'add' || !elementId)
                    ? (elementId || `table-${(elementTitle || 'new').toLowerCase().replace(/\s+/g, '-')}`)
                    : elementId,
                type: "table",
                title: elementTitle || "Unified Table",
                description: elementDescription || "",
                columns: tableColumns
                    ? tableColumns.split(",").map((col: string) => {
                        const [key, header] = col.split(":").map(s => s.trim());
                        return { key, header: header || key };
                    })
                    : [],
                data: finalData
            };
        } else if (elementType === "metric") {
            let computedValue = metricValue;

            // FORMULA PARSING: If metricValue looks like "sum(sales_amount)" or "avg(total)", parse it.
            if (typeof metricValue === 'string' && !aggregation) {
                const formulaMatch = metricValue.match(/^(\w+)\((.+)\)$/);
                if (formulaMatch) {
                    const [_, func, col] = formulaMatch;
                    if (['sum', 'avg', 'count', 'min', 'max'].includes(func.toLowerCase())) {
                        effectiveAggregation = func.toLowerCase();
                        effectiveSeriesArray = [col.trim()];
                        console.log(`useDashboard: Parsed metric formula ${func}(${col})`);
                    }
                }
            }

            // RAW COLUMN FALLBACK: If metricValue is a raw column name and no aggregation is set, default to 'sum'.
            const availableColumns = data.length > 0 ? Object.keys(data[0]) : [];
            if (!effectiveAggregation && availableColumns.includes(String(metricValue))) {
                effectiveAggregation = 'sum';
                effectiveSeriesArray = [String(metricValue)];
                console.log(`useDashboard: Auto-aggregating raw column ${metricValue} for metric.`);
            }

            if (effectiveAggregation && effectiveAggregation !== 'none' && effectiveSeriesArray.length > 0) {
                const globalAgg = aggregateData(parsedData, undefined, effectiveSeriesArray, effectiveAggregation);
                if (globalAgg.length > 0) {
                    computedValue = String(globalAgg[0][effectiveSeriesArray[0]]);
                    console.log(computedValue);
                }
            }

            if (computedValue) {
                const cleanVal = String(computedValue).replace(/[$,]/g, '');
                const num = parseFloat(cleanVal);

                if (!isNaN(num)) {
                    const lowerLabel = (metricLabel || elementTitle || "").toLowerCase();
                    const lowerSeries = (effectiveSeriesArray[0] || "").toLowerCase();
                    const isRevenue = lowerLabel.includes('revenue') || lowerLabel.includes('sales') ||
                        lowerSeries.includes('revenue') || lowerSeries.includes('sales');

                    if (isRevenue) {
                        computedValue = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                        }).format(num);
                    } else {
                        computedValue = new Intl.NumberFormat('en-US', {
                            maximumFractionDigits: 2
                        }).format(num);
                    }
                }
            }

            element = {
                id: (action === 'add' || !elementId)
                    ? (elementId || `metric-${(metricLabel || elementTitle || 'new').toLowerCase().replace(/\s+/g, '-')}`)
                    : elementId,
                type: "metric",
                label: metricLabel || elementTitle || "Metric",
                value: computedValue || (parsedData.length > 0 ? String(Object.values(parsedData[0])[0]) : "0"),
                change: typeof metricChange === 'string' ? parseFloat(metricChange) : metricChange,
                trend: metricTrend || "neutral",
                description: elementDescription || "",
            };
        } else {
            element = {
                id: (action === 'add' || !elementId)
                    ? (elementId ? `${elementId}-${Date.now()}` : `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`)
                    : elementId,
                type: elementType || "chart",
                title: elementTitle || "Untitled",
                description: elementDescription || "",
                data: parsedData,
            };
        }
        return element;
    };

    // NOTE: CopilotKit Cloud requires flat, primitive parameters only.
    // Arrays (string[], object[]) and deeply nested objects cause HTTP 500 from the Cloud API.
    // We use flat scalar parameters and reconstruct the element object in the handler.
    useCopilotAction({
        name: "updateDashboardUI",
        description: "A tool to visually modify the dashboard by adding, removing, or updating charts, metrics, and tables. CRITICAL: Only use this when the user explicitly asks for a layout or UI change (e.g., 'add a chart', 'drop the metric', 'update the table'). For simple data questions or conversation, respond with text instead.",
        parameters: [
            {
                name: "action",
                type: "string",
                description: "Action to perform: 'add', 'remove', or 'update'.",
                enum: ["add", "remove", "update"],
                required: true,
            },
            {
                name: "elementId",
                type: "string",
                description: "ID of the element. Mandatory for 'remove' or 'update'.",
                required: false,
            },
            {
                name: "elementType",
                type: "string",
                description: "Type of element: 'chart', 'metric', or 'table'.",
                enum: ["chart", "metric", "table"],
                required: false,
            },
            {
                name: "elementTitle",
                type: "string",
                description: "Title for the UI element.",
                required: false,
            },
            {
                name: "elementDescription",
                type: "string",
                description: "Optional context or description.",
                required: false,
            },
            {
                name: "chartType",
                type: "string",
                description: "Visual style: 'line', 'bar', 'area', 'pie', 'scatter', 'radar', 'histogram'.",
                enum: ["line", "bar", "area", "pie", "scatter", "radar", "histogram"],
                required: false,
            },
            {
                name: "configXAxis",
                type: "string",
                description: "The column key for labels or grouping (e.g. 'Project_Name', 'Region').",
                required: false,
            },
            {
                name: "configSeries",
                type: "string",
                description: "Comma-separated keys for the values to plot. IMPORTANT: For sum/avg, use NUMERIC columns (e.g. 'Sales_Amount'). For counting distributions (e.g. 'Employees by Dept'), use the category column here (e.g. 'Department') and set aggregation='count'.",
                required: false,
            },
            {
                name: "configColors",
                type: "string",
                description: "Comma-separated hex colors (optional).",
                required: false,
            },
            {
                name: "configShowLegend",
                type: "boolean",
                description: "Whether to show the legend.",
                required: false,
            },
            {
                name: "metricValue",
                type: "string",
                description: "The primary number/string for a metric.",
                required: false,
            },
            {
                name: "metricLabel",
                type: "string",
                description: "Label for the metric.",
                required: false,
            },
            {
                name: "metricChange",
                type: "number",
                description: "Optional percentage change.",
                required: false,
            },
            {
                name: "metricTrend",
                type: "string",
                description: "Trend: 'up', 'down', or 'neutral'.",
                enum: ["up", "down", "neutral"],
                required: false,
            },
            {
                name: "tableColumns",
                type: "string",
                description: "Comma-separated 'key:Label' pairs for table columns.",
                required: false,
            },
            {
                name: "aggregation",
                type: "string",
                description: "Calculation to apply: 'sum', 'avg', 'count', 'min', 'max'. CRITICAL: Use 'count' for distribution charts (e.g. counting occurrences).",
                enum: ["sum", "avg", "count", "min", "max", "none"],
                required: false,
            },
            {
                name: "message",
                type: "string",
                description: "A message to display to the user explaining what is being changed.",
                required: false,
            },
            {
                name: "dataJson",
                type: "string",
                description: "Optional JSON array of objects. If omitted, the connected dataset is used. For metrics, use 'aggregation' + 'configSeries' instead of passing a formula here.",
                required: false,
            },
        ],
        handler: async (args) => {
            console.log("ACTION_HANDLER_DEBUG: updateDashboardUI triggered with args:", JSON.stringify(args).substring(0, 200));
            console.log("CopilotAction:updateDashboardUI triggered", {
                ...args,
                dataJson: args.dataJson ? (args.dataJson.length > 100 ? args.dataJson.substring(0, 100) + "..." : args.dataJson) : null
            });

            if (args.action === "remove") {
                updateDashboard("remove", undefined, args.elementId);
                return;
            }

            const element = prepareElement(args, localData);
            updateDashboard(args.action as string, element, args.elementId);
        },
    });

    const hasData = localData.length > 0;
    const headers = useMemo(() => hasData ? Object.keys(localData[0]) : [], [localData, hasData]);
    const head5 = useMemo(() => localData.slice(0, 5), [localData]);

    // Share the data schema and sample with the AI so it knows what columns are available
    useCopilotReadable({
        description: `Currently connected dataset schema and sample. Total records: ${localData.length}`,
        value: hasData ? {
            columns: headers,
            sampleData: head5,
        } : "No data source connected.",
    });

    const summarizedDashboard = useMemo(() => ({
        ...dashboard,
        elements: dashboard.elements.map(el => {
            const base = {
                id: el.id,
                type: el.type,
            };

            if (el.type === 'chart') {
                return {
                    ...base,
                    elementTitle: el.title,
                    elementDescription: el.description,
                    chartType: el.chartType,
                    configXAxis: el.config.xAxis,
                    configSeries: el.config.series.join(','),
                    dataLength: el.data?.length || 0
                };
            }

            if (el.type === 'table') {
                return {
                    ...base,
                    elementTitle: el.title,
                    dataLength: el.data?.length || 0,
                    tableColumns: el.columns.map(c => `${c.key}:${c.header}`).join(',')
                };
            }

            if (el.type === 'metric') {
                return {
                    ...base,
                    metricLabel: (el as any).label,
                    metricValue: String((el as any).value),
                    metricChange: (el as any).change,
                    metricTrend: (el as any).trend
                };
            }

            return base;
        })
    }), [dashboard]);

    useCopilotReadable({
        description: "The tabular data available for the dashboard. CRITICAL: This data is merged from MULTIPLE DISTINCT SOURCES. Each row contains a '__source' field indicating which file it came from. When analyzing or generating a dashboard, YOU MUST GIVE EQUAL PRIORITY TO ALL SOURCES. Try to find correlations between sources or ensure each source has its own representative metrics/charts on the dashboard.",
        value: localData,
    });
    useCopilotReadable({
        description: "The current dashboard configuration and its elements (metadata only). Check this list before adding a new element to see if you should update or remove an existing one instead.",
        value: summarizedDashboard,
    });

    return {
        dashboard,
        updateDashboard,
        prepareElement,
        saveDashboard: async (name: string, description?: string, connectedSourcesInput?: ConnectedSource[]) => {
            const data = {
                name,
                description: description || '',
                data: {
                    elements: dashboard.elements,
                    layout: dashboard.layout,
                },
                connectedSources: connectedSourcesInput || [],
            };
            const result = await dashboardApi.create(data);
            return result;
        },
        updateDashboardToDb: async (id: string, name?: string, description?: string, connectedSourcesInput?: ConnectedSource[]) => {
            const data: any = {};
            if (name) data.name = name;
            if (description !== undefined) data.description = description;
            data.data = {
                elements: dashboard.elements,
                layout: dashboard.layout,
            };
            if (connectedSourcesInput !== undefined) {
                data.connectedSources = connectedSourcesInput;
            }
            const result = await dashboardApi.update(id, data);
            return result;
        },
        loadDashboard: async (id: string) => {
            const result = await dashboardApi.getById(id);
            console.log('[useDashboard] Raw API result:', result);
            console.log('[useDashboard] result.data:', result.data);
            console.log('[useDashboard] result.charts:', result.charts);
            const parsed = parseBackendDashboard(result);
            console.log('[useDashboard] Parsed dashboard:', parsed);
            setDashboard(parsed);
            return result;
        },
        getAllDashboards: () => dashboardApi.getAll(),
        deleteDashboard: (id: string) => dashboardApi.delete(id),
    };
};
