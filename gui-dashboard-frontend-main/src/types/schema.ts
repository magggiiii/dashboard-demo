import { z } from 'zod';

export const ChartTypeSchema = z.enum(['bar', 'line', 'pie', 'area', 'scatter', 'radar', 'radialbar', 'treemap', 'funnel', 'sankey', 'composed', 'histogram']);

export const VisualizationSchema = z.object({
  id: z.string().optional().default(() => Math.random().toString(36).substring(2, 11)),
  type: z.literal('chart'),
  chartType: ChartTypeSchema,
  title: z.string(),
  description: z.string().optional().nullable(),
  config: z.object({
    xAxis: z.string(),
    yAxis: z.string().optional().nullable(),
    series: z.array(z.string()),
    colors: z.array(z.string()).optional().nullable(),
    stacked: z.preprocess((val) => val === 'true' ? true : (val === 'false' ? false : val), z.boolean().optional().nullable()),
    showLegend: z.preprocess((val) => val === 'true' ? true : (val === 'false' ? false : val), z.boolean().optional().default(true).nullable()),
    aggregation: z.enum(['sum', 'avg', 'count', 'min', 'max', 'none']).optional().nullable(),
  }),
  data: z.array(z.record(z.string(), z.any())),
});

export const TableSchema = z.object({
  id: z.string().optional().default(() => Math.random().toString(36).substring(2, 11)),
  type: z.literal('table'),
  title: z.string(),
  description: z.string().optional().nullable(),
  columns: z.array(z.object({
    key: z.string(),
    header: z.string(),
    sortable: z.preprocess((val) => val === 'true' ? true : (val === 'false' ? false : val), z.boolean().optional().nullable()),
  })),
  data: z.array(z.record(z.string(), z.any())),
});

export const MetricSchema = z.object({
  id: z.string().optional().default(() => Math.random().toString(36).substring(2, 11)),
  type: z.literal('metric'),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.number().optional().nullable(),
  trend: z.enum(['up', 'down', 'neutral']).optional().nullable(),
});

export const UIElementSchema = z.discriminatedUnion('type', [
  VisualizationSchema,
  TableSchema,
  MetricSchema,
]);

export const DashboardSchema = z.object({
  layout: z.array(z.object({
    i: z.string(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  })).optional(),
  elements: z.array(UIElementSchema),
});

export type ChartType = z.infer<typeof ChartTypeSchema>;
export type Visualization = z.infer<typeof VisualizationSchema>;
export type Table = z.infer<typeof TableSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type UIElement = z.infer<typeof UIElementSchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;
