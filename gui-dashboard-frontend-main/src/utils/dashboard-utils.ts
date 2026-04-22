/**
 * Helper to aggregate data based on a grouping key and aggregation type.
 */
export const aggregateData = (data: any[], xAxis: string | undefined, series: string[], type: string) => {
    if (!type || type === 'none' || !series || series.length === 0 || data.length === 0) return data;

    const groups: Record<string, any> = {};
    const hasXAxis = !!xAxis;

    data.forEach(row => {
        const key = hasXAxis ? String(row[xAxis!] || 'Unknown') : 'GLOBAL_BUCKET';
        if (!groups[key]) {
            groups[key] = hasXAxis ? { [xAxis!]: key } : {};
            series.forEach(s => {
                const countKey = (type === 'count' && s === xAxis) ? `${s}_count` : s;
                groups[key][countKey] = type === 'count' ? 0 : [];
            });
        }

        series.forEach(s => {
            const countKey = (type === 'count' && s === xAxis) ? `${s}_count` : s;
            const rawVal = row[s];
            const val = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/[$,]/g, ''));

            if (type === 'count') {
                groups[key][countKey] += 1;
            } else if (!isNaN(val)) {
                groups[key][countKey].push(val);
            }
        });
    });

    return Object.values(groups).map(group => {
        series.forEach(s => {
            if (type === 'sum') {
                group[s] = group[s].reduce((a: number, b: number) => a + b, 0);
            } else if (type === 'avg') {
                group[s] = group[s].length > 0 ? group[s].reduce((a: number, b: number) => a + b, 0) / group[s].length : 0;
            } else if (type === 'min') {
                group[s] = group[s].length > 0 ? Math.min(...group[s]) : 0;
            } else if (type === 'max') {
                group[s] = group[s].length > 0 ? Math.max(...group[s]) : 0;
            }
        });
        return group;
    });
};
