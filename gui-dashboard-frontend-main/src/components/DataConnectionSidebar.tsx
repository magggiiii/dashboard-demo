"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, Sheet, ArrowLeft, FileType } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SpreadsheetPreview } from './SpreadsheetPreview';
import { fileApi } from '@/lib/dashboard';

export interface ConnectedSource {
    id: string;
    name: string;
    type: 'file' | 'sheet';
    url?: string;
    fileId?: string;
    createdAt?: string;
}

interface DataConnectionSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    allParsedData: { sourceId: string; data: Record<string, unknown>[] }[];
    connectedSources: ConnectedSource[];
    currentDashboardId?: string | null;
    onSourceAdded: (source: ConnectedSource, data: Record<string, unknown>[]) => void;
    onSourceRemoved: (sourceId: string) => void;
    uiV2?: boolean;
}

type ViewType = 'menu' | 'upload' | 'google-sheets' | 'preview';

export const DataConnectionSidebar: React.FC<DataConnectionSidebarProps> = ({
    isOpen,
    onClose,
    allParsedData,
    connectedSources,
    currentDashboardId,
    onSourceAdded,
    onSourceRemoved,
    uiV2 = false,
}) => {
    const [view, setView] = useState<ViewType>('menu');
    const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sheetUrl, setSheetUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBack = () => {
        setView('menu');
        setSheetUrl('');
        setPreviewSourceId(null);
    };

    const handleDisconnect = (e: React.MouseEvent, sourceId: string) => {
        e.stopPropagation();
        onSourceRemoved(sourceId);
        if (previewSourceId === sourceId) {
            setView('menu');
            setPreviewSourceId(null);
        }
    };

    const parseCSV = (text: string) => {
        const workbook = XLSX.read(text, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(worksheet);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const filesArray = Array.from(files);

        try {
            for (const file of filesArray) {
                const uploadedFile = await fileApi.upload(file, currentDashboardId || undefined);

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

                        const sourceId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                        const source: ConnectedSource = {
                            id: sourceId,
                            name: file.name,
                            type: 'file',
                            fileId: uploadedFile.id,
                            createdAt: uploadedFile.createdAt,
                        };

                        onSourceAdded(source, data);
                    } catch (err) {
                        console.error('Parsing error:', err);
                    }
                };
                reader.readAsArrayBuffer(file);
            }

            setTimeout(() => {
                setIsUploading(false);
                setView('menu');
            }, 800);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
            setIsUploading(false);
        }
    };

    const handleGoogleSheetsConnect = async () => {
        if (!sheetUrl.trim()) return;

        setIsConnecting(true);
        try {
            let spreadsheetId = sheetUrl;
            if (sheetUrl.includes('/d/')) {
                const parts = sheetUrl.split('/d/');
                spreadsheetId = parts[1].split('/')[0];
            } else if (sheetUrl.includes('id=')) {
                const parts = sheetUrl.split('id=');
                spreadsheetId = parts[1].split('&')[0];
            }

            const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
            const response = await fetch(exportUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch sheet.');
            }

            const csvText = await response.text();
            const data = parseCSV(csvText) as Record<string, unknown>[];

            const sourceId = `sheet-${Date.now()}`;
            const source: ConnectedSource = {
                id: sourceId,
                name: `Sheet: ${spreadsheetId.substring(0, 8)}...`,
                type: 'sheet',
                url: sheetUrl,
            };

            onSourceAdded(source, data);
            setIsConnecting(false);
            setView('menu');
            setSheetUrl('');
        } catch (error) {
            console.error('Google Sheets error:', error);
            setIsConnecting(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    fixed top-0 right-0 h-full w-[28rem] z-[70]
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    flex flex-col ${uiV2 ? 'ui-panel-v2 motion-panel' : 'bg-white shadow-2xl'}
                `}
            >
                <div className="flex flex-col border-b border-slate-200">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <div className="flex items-center gap-3">
                            {view !== 'menu' && (
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </button>
                            )}
                            <h2 className="text-xl font-semibold text-slate-900">
                                {view === 'menu' ? 'Data Connections' :
                                    view === 'upload' ? 'Upload File' :
                                        view === 'google-sheets' ? 'Google Sheets' :
                                            'Data Preview'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {connectedSources.length > 0 && view !== 'preview' && (
                        <div className="px-6 pb-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {connectedSources.map((source) => (
                                <button
                                    key={source.id}
                                    onClick={() => {
                                        setPreviewSourceId(source.id);
                                        setView('preview');
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-1.5 rounded-lg ${source.type === 'file' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                                            {source.type === 'file' ? <FileType className="w-3.5 h-3.5 text-indigo-600" /> : <Sheet className="w-3.5 h-3.5 text-green-600" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{source.name}</p>
                                                <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-bold group-hover:bg-slate-300 transition-colors uppercase">Preview</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={(e) => handleDisconnect(e, source.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`flex-1 ${view === 'preview' ? 'overflow-hidden' : 'overflow-y-auto'} p-6`}>
                    {view === 'menu' ? (
                        <div className="space-y-4">
                            <button
                                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                                onClick={() => setView('upload')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                        <Upload className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-slate-900 mb-1">Upload File</h3>
                                        <p className="text-sm text-slate-600">Upload CSV, Excel, or JSON files</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all group"
                                onClick={() => setView('google-sheets')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <Sheet className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-slate-900 mb-1">Google Sheets</h3>
                                        <p className="text-sm text-slate-600">Connect to Google Sheets</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : view === 'upload' ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 py-12">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".csv,.json,.xlsx,.xls"
                                multiple
                            />
                            <button
                                onClick={triggerFileInput}
                                disabled={isUploading}
                                className={`
                                    w-48 h-48 rounded-full border-4 border-dashed border-slate-200
                                    flex flex-col items-center justify-center gap-4
                                    hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group
                                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <div className={`p-6 bg-slate-100 rounded-full group-hover:bg-indigo-100 transition-colors ${isUploading ? 'animate-pulse' : ''}`}>
                                    <Upload className="w-12 h-12 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">
                                    {isUploading ? 'Uploading...' : 'Click to upload'}
                                </span>
                            </button>
                        </div>
                    ) : view === 'google-sheets' ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Google Sheet URL</label>
                                <input
                                    type="text"
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition-all text-slate-900"
                                />
                            </div>
                            <button
                                onClick={handleGoogleSheetsConnect}
                                disabled={isConnecting || !sheetUrl.trim()}
                                className={`
                                    w-full p-4 bg-green-600 text-white rounded-xl font-semibold shadow-lg
                                    hover:bg-green-700 transition-all flex items-center justify-center gap-2
                                    ${(isConnecting || !sheetUrl.trim()) ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isConnecting ? 'Connecting...' : 'Connect Sheet'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 flex flex-col gap-4">
                            <div className="flex-none flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">Previewing: <span className="text-slate-900 font-bold">{connectedSources.find(s => s.id === previewSourceId)?.name}</span></p>
                                <button onClick={(e) => previewSourceId && handleDisconnect(e, previewSourceId)} className="text-xs text-red-500 font-semibold hover:underline">Disconnect</button>
                            </div>
                            <div className="flex-1 min-h-0 border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden">
                                <SpreadsheetPreview data={allParsedData.find(d => d.sourceId === previewSourceId)?.data || []} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 text-center">Data connection mode active</p>
                </div>
            </div>
        </>
    );
};
