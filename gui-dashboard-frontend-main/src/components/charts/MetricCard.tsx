import React from 'react';
import { Metric } from '@/types/schema';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

export const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
    const isPositive = metric.trend === 'up';
    const isNegative = metric.trend === 'down';

    return (
        <div className="ui-panel-v2 motion-panel p-4 md:p-5 rounded-2xl shadow-sm flex flex-col h-full min-h-[180px] card-hover relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ui-surface-2)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500 ease-in-out" />
            <div className="relative z-10 mb-4">
                <span className="ui-muted-v2 text-xs font-semibold uppercase tracking-wider truncate block">{metric.label}</span>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center min-h-0">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight break-all text-center">
                    {metric.value}
                </span>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between">
                <div>
                    {metric.change !== undefined && (
                        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            isNegative ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                            {isPositive && <ArrowUpIcon className="w-3 h-3 mr-1" />}
                            {isNegative && <ArrowDownIcon className="w-3 h-3 mr-1" />}
                            {!isPositive && !isNegative && <MinusIcon className="w-3 h-3 mr-1" />}
                            {Math.abs(metric.change || 0)}%
                        </div>
                    )}
                </div>
                <span className="ui-muted-v2 text-xs font-medium">vs last month</span>
            </div>
        </div>
    );
};
