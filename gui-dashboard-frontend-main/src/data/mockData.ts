import { Dashboard } from '@/types/schema';

export const mockSalesData = [
    { month: 'Jan', sales: 4000, revenue: 2400 },
    { month: 'Feb', sales: 3000, revenue: 2210 },
    { month: 'Mar', sales: 5000, revenue: 2290 },
    { month: 'Apr', sales: 4780, revenue: 2000 },
    { month: 'May', sales: 5890, revenue: 2181 },
    { month: 'Jun', sales: 4390, revenue: 2500 },
    { month: 'Jul', sales: 6490, revenue: 2100 },
];

export const mockLLMResponse = {
    intent: 'visualize_sales',
    suggestion: 'I have generated a bar chart for your monthly sales data.',
    schema: {
        id: 'dynamic-chart-1',
        type: 'chart',
        chartType: 'bar',
        title: 'Monthly Sales Analysis',
        config: {
            xAxis: 'month',
            series: ['sales', 'revenue'],
            colors: ['#3b82f6', '#10b981'],
            showLegend: true,
        },
        data: mockSalesData,
    },
};
