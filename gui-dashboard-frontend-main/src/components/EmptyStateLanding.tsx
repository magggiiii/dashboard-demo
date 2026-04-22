"use client";

import React, { useRef, useState } from 'react';
import { Upload, MessageSquare, Plus, Database, Search, ArrowRight, LayoutDashboard } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ConnectedSource } from './DataConnectionSidebar';
import { fileApi } from '@/lib/dashboard';

interface EmptyStateLandingProps {
    onDataUpload: (data: Record<string, unknown>[], source: ConnectedSource) => void;
    onStartChat: (message: string) => void;
    connectedSources: ConnectedSource[];
    suggestions: string[];
    dashboardId?: string;
}

export const EmptyStateLanding: React.FC<EmptyStateLandingProps> = ({
    onDataUpload,
    onStartChat,
    connectedSources,
    suggestions,
    dashboardId,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);

        for (const file of filesArray) {
            setUploadingFiles(prev => [...prev, file.name]);

            try {
                const uploadedFile = await fileApi.upload(file, dashboardId);

                const reader = new FileReader();

                reader.onload = (e) => {
                    const dataBuffer = e.target?.result;
                    let data: Record<string, unknown>[] = [];

                    try {
                        if (file.name.endsWith('.json')) {
                            const content = new TextDecoder().decode(dataBuffer as ArrayBuffer);
                            const parsed = JSON.parse(content);
                            data = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
                        } else {
                            const workbook = XLSX.read(dataBuffer, { type: 'array' });
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];
                            data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
                        }

                        onDataUpload(data, {
                            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            name: file.name,
                            type: 'file',
                            fileId: uploadedFile.id,
                            createdAt: uploadedFile.createdAt,
                        });

                        setUploadingFiles(prev => prev.filter(name => name !== file.name));
                    } catch (err) {
                        console.error('Parsing error:', err);
                        setUploadingFiles(prev => prev.filter(name => name !== file.name));
                    }
                };

                reader.readAsArrayBuffer(file);
            } catch (error: any) {
                console.error('Upload error:', error);
                alert(`Upload failed for ${file.name}. Please try again.`);
                setUploadingFiles(prev => prev.filter(name => name !== file.name));
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onStartChat(inputValue);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start pt-[20vh] min-h-[80vh] px-4">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Let AI Build Your Dashboard
                    </h2>
                    <p className="text-slate-500 text-lg max-w-lg mx-auto">
                        {connectedSources.length > 0
                            ? `Connected to ${connectedSources.length} source${connectedSources.length > 1 ? 's' : ''}. What would you like to analyze?`
                            : "Connect your sources or describe what you want to build. Our AI will handle the rest."
                        }
                    </p>
                </div>

                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    {connectedSources.length === 0 ? (
                        <form
                            onSubmit={handleSubmit}
                            className="relative group h-16"
                        >
                            <div className="absolute inset-0 bg-indigo-600/5 blur-xl group-hover:bg-indigo-600/10 transition-colors rounded-2xl" />
                            <div className="relative h-full flex items-center bg-white border-2 border-slate-200 rounded-2xl px-4 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className={`p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95 group/upload ${uploadingFiles.length > 0 ? 'animate-pulse text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                                    title="Upload data file"
                                >
                                    <Upload className="w-6 h-6" />
                                </button>

                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Upload one or more files and get your dashboard"
                                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-lg px-4"
                                />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center gap-2 px-4 font-bold"
                                >
                                    <span>Analyze</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-3 flex items-center justify-center gap-2 text-slate-400 text-sm">
                                <Plus className="w-3.5 h-3.5" />
                                <span>Support for multiple CSV, JSON, or Excel files</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".csv,.json,.xlsx,.xls"
                                multiple
                            />
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <form
                                onSubmit={handleSubmit}
                                className="relative group h-16"
                            >
                                <div className="absolute inset-0 bg-indigo-600/5 blur-xl group-hover:bg-indigo-600/10 transition-colors rounded-2xl" />
                                <div className="relative h-full flex items-center bg-white border-2 border-slate-200 rounded-2xl px-4 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        title="Upload more data"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>

                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Ask a question about your data..."
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-lg px-4"
                                    />

                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center gap-2 px-4 font-bold"
                                    >
                                        <span>Ask</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".csv,.json,.xlsx,.xls"
                                    multiple
                                />
                            </form>

                            <div className="grid grid-cols-1 gap-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Or try a suggestion</p>
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onStartChat(suggestion)}
                                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-left hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all active:scale-[0.98] group flex items-center justify-between"
                                    >
                                        <span className="text-slate-700 font-medium">{suggestion}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-100/50 border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Database className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">CSV, Excel, JSON support</span>
                    </div>
                    <div className="p-4 bg-slate-100/50 border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Plus className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">AI-powered visualizations</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
