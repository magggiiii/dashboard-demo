"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full text-center space-y-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
                            <p className="text-slate-500 text-sm">
                                We encountered an unexpected error while rendering this part of the dashboard.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
