"use client";
import { logger } from '@/utils/logger';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Database, X, List, FileType, Sheet } from 'lucide-react';
import {
    CopilotChat,
    AssistantMessageProps,
    AssistantMessage as CopilotAssistantMessage,
    UserMessageProps,
    UserMessage as CopilotUserMessage,
    RenderMessageProps
} from "@copilotkit/react-ui";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { SpreadsheetPreview } from './SpreadsheetPreview';
import { useCopilotChatMessages } from '@/context/CopilotChatContext';

// Custom component to hide technical tags from the chat UI
const FilteredAssistantMessage = (props: AssistantMessageProps) => {
    // If we have a message, strip out the technical <function> tags for the UI
    const content = props.message?.content;
    // Hyper-robust regex to catch updateDashboardUI tags even if squashed or malformed
    const tagMatch = typeof content === 'string' && /<function(?:[./\(])(updateDashboardUI).*?({[\s\S]*?})\s*(?:<\/function>|(?=<function|$)|>)/.exec(content);
    const hasTags = !!tagMatch;

    const filteredContent = typeof content === 'string'
        ? content.replace(/<function[.(][\s\S]*?>[\s\S]*?(?:<\/function>|$)/g, '').trim()
        : content;

    let fallbackText = "";
    if (hasTags && !filteredContent) {
        try {
            const args = JSON.parse(tagMatch[2]);
            const action = args.action === 'remove' ? 'Removing' : (args.action === 'update' ? 'Updating' : 'Adding');
            const type = args.elementType || 'element';
            const title = args.elementTitle || args.elementId || '';
            fallbackText = `[System] ${action} ${type}${title ? `: ${title}` : ''}...`;
        } catch (e) {
            fallbackText = "[System] Executing dashboard action...";
        }
    }

    const displayContent = filteredContent || fallbackText;

    const filteredMessage = props.message ? {
        ...props.message,
        content: displayContent
    } : props.message;

    // If the message is completely empty (no text, no tags) and not loading, hide it
    if (filteredMessage && !filteredMessage.content && !props.isLoading) {
        return null;
    }

    // Pass the filtered message to the standard renderer
    return <CopilotAssistantMessage
        {...props}
        message={filteredMessage as any}
        rawData={props.rawData}
        ImageRenderer={props.ImageRenderer!}
    />;
};

// Even more comprehensive: Filter at the RenderMessage level to handle User messages too
const FilteredRenderMessage = (props: RenderMessageProps) => {
    const { message } = props;
    if (typeof message.content === 'string') {
        const tagMatch = /<function(?:\.|\()(updateDashboardUI).*?({[\s\S]*?})\s*(?:<\/function>|(?=<function|$)|>)/.exec(message.content);
        const hasTags = !!tagMatch;
        const cleaned = message.content.replace(/<function(?:\.|\()[^>]*?>[\s\S]*?(?:<\/function>|$)/g, '').trim();

        let fallbackText = "";
        if (hasTags && !cleaned && message.role === 'assistant') {
            try {
                const args = JSON.parse(tagMatch[2]);
                const action = args.action === 'remove' ? 'Removing' : (args.action === 'update' ? 'Updating' : 'Adding');
                fallbackText = `[System] ${action} ${args.elementType || 'element'}...`;
            } catch (e) {
                fallbackText = "[System] Executing dashboard action...";
            }
        }

        const displayContent = cleaned || fallbackText;

        if (message.role === 'user') {
            return <CopilotUserMessage
                {...props}
                message={{ ...message, content: cleaned } as any}
                rawData={message}
                ImageRenderer={props.ImageRenderer!}
            />;
        } else if (message.role === 'assistant') {
            if (!displayContent && !props.inProgress) return null;
            return <CopilotAssistantMessage
                {...props}
                message={{ ...message, content: displayContent } as any}
                rawData={message}
                // AssistantMessage expects these specific props if used directly
                isLoading={props.inProgress && props.isCurrentMessage && !displayContent}
                isGenerating={props.inProgress && props.isCurrentMessage && !!displayContent}
                // Wrap onRegenerate to match signature
                onRegenerate={() => props.onRegenerate?.(message.id)}
                ImageRenderer={props.ImageRenderer!}
            />;
        }
    }
    // Fallback for other message types (if any)
    return null;
};

interface ChatDataSidebarProps {
    allParsedData: { sourceId: string; data: Record<string, unknown>[] }[];
    connectedSources: any[];
    onDisconnectSource: (sourceId: string) => void;
    onClose: () => void;
    uiV2?: boolean;
}

const INITIAL_MESSAGE = "Hi there! 👋 What would you like to see or change on your dashboard?";

// Inner component that uses useCopilotChat hook
const ChatInterface = ({ onMessage }: { onMessage: (msg: any) => void }) => {
    const { isLoading, messages, setMessages } = useCopilotChatInternal();
    const { chatMessages, restoreVersion } = useCopilotChatMessages();
    const prevLoadingRef = useRef<boolean>(false);
    // Track which restore version we last synced, so dashboard switches re-trigger
    const lastRestoredVersionRef = useRef<number>(-1);
    // Track the count of messages we already processed for AI capture
    const lastProcessedCountRef = useRef<number>(0);

    // Restore/sync persisted messages into CopilotChat when dashboard switches
    // Only fires when restoreVersion changes (setChatMessages called), NOT on individual appends
    useEffect(() => {
        if (restoreVersion === lastRestoredVersionRef.current) return;

        if (chatMessages && chatMessages.length > 0) {
            logger.log('Syncing context messages to CopilotChat (version', restoreVersion, '):', chatMessages.length);
            const copilotMessages = chatMessages.map(msg => new TextMessage({
                role: msg.role === 'assistant' ? MessageRole.Assistant : MessageRole.User,
                content: msg.content,
            }));
            setMessages(copilotMessages);
            // Set processed count so we don't re-capture these restored messages as "new" AI
            lastProcessedCountRef.current = copilotMessages.length;
        } else {
            // Context was cleared (new dashboard or reset) — clear CopilotChat state too
            logger.log('Clearing CopilotChat messages (version', restoreVersion, ')');
            setMessages([]);
            lastProcessedCountRef.current = 0;
        }

        lastRestoredVersionRef.current = restoreVersion;
    }, [restoreVersion, chatMessages, setMessages]);

    // Capture new AI assistant responses from CopilotChat's messages array
    // instead of fragile DOM scraping
    useEffect(() => {
        if (prevLoadingRef.current === true && isLoading === false) {
            // AI just finished responding — check for new assistant messages
            const timer = setTimeout(() => {
                if (messages.length > lastProcessedCountRef.current) {
                    // Process any new messages since last check
                    for (let i = lastProcessedCountRef.current; i < messages.length; i++) {
                        const msg = messages[i];
                        // Get the content — handles TextMessage objects
                        const content = typeof msg === 'object' && 'content' in msg
                            ? (msg as any).content
                            : String(msg);
                        const role = typeof msg === 'object' && 'role' in msg
                            ? ((msg as any).role === MessageRole.Assistant ? 'assistant' : 'user')
                            : 'assistant';

                        if (content && content !== INITIAL_MESSAGE) {
                            logger.log('Captured new message from messages array:', role, content.substring(0, 50));
                            onMessage({
                                content,
                                role,
                                timestamp: Date.now()
                            });
                        }
                    }
                    lastProcessedCountRef.current = messages.length;
                }
            }, 300);
            return () => clearTimeout(timer);
        }
        prevLoadingRef.current = isLoading;
    }, [isLoading, messages, onMessage]);

    const [instructions, setInstructions] = useState<string>("You are a helpful Dashboard Assistant. You help users analyze data and manage their dashboard. Always respond to greetings and general questions with a friendly text response. Only use the dashboard tools when the user explicitly asks for a change to the UI/Layout.");

    useEffect(() => {
        const fetchInstructions = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/copilotkit/instructions`);
                const data = await response.json();
                if (data.instructions) {
                    setInstructions(data.instructions);
                }
            } catch (error) {
                logger.error("Failed to fetch instructions from backend:", error);
            }
        };
        fetchInstructions();
    }, []);

    return (
        <CopilotChat
            instructions={instructions}
            labels={{
                initial: INITIAL_MESSAGE
            }}
            onSubmitMessage={(message: string) => {
                logger.log('User submitted message:', message);
                onMessage({
                    content: message,
                    role: 'user',
                    timestamp: Date.now()
                });
            }}
            onInProgress={(inProgress: boolean) => {
                logger.log('AI in progress:', inProgress);
            }}
            AssistantMessage={FilteredAssistantMessage}
            RenderMessage={FilteredRenderMessage}
        />
    );
};

export const ChatDataSidebar = ({ allParsedData, connectedSources, onDisconnectSource, onClose, uiV2 = false }: ChatDataSidebarProps) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'data'>('chat');
    const { onNewCopilotMessage } = useCopilotChatMessages();

    return (
        <div className={`flex flex-col h-full relative ${uiV2 ? 'ui-panel-v2' : 'bg-white'} ${uiV2 ? 'motion-panel' : ''}`}>
            {/* Header Tabs */}
            <div className={`flex items-center justify-between px-4 ${uiV2 ? 'border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)]' : 'border-b border-slate-200 bg-slate-50/50'}`}>
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'chat'
                            ? 'text-indigo-600 border-indigo-600 bg-white'
                            : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'data'
                            ? 'text-indigo-600 border-indigo-600 bg-white'
                            : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        Data
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' ? (
                    <div className="h-full copilot-chat-container">
                        <ChatInterface onMessage={onNewCopilotMessage} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col p-4 bg-slate-50 overflow-y-auto custom-scrollbar">
                        {connectedSources.length > 0 ? (
                            <div className="space-y-6">
                                {connectedSources.map((source) => {
                                    const sourceData = allParsedData.find(d => d.sourceId === source.id)?.data || [];
                                    return (
                                        <div key={source.id} className="space-y-3">
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                            {source.type === 'file' ? <FileType className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-slate-900 leading-tight truncate" title={source.name}>
                                                                {source.name}
                                                            </h3>
                                                            <p className="text-xs text-slate-500">Connected {source.createdAt ? new Date(source.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => onDisconnectSource(source.id)}
                                                        className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md flex-shrink-0 ml-4"
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                                                        <Sheet className="w-3.5 h-3.5" />
                                                        {sourceData.length} records
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                                                        <List className="w-3.5 h-3.5" />
                                                        {Object.keys(sourceData[0] || {}).length} columns
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[300px] flex flex-col">
                                                <div className="p-3 border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">
                                                    Data Preview: {source.name}
                                                </div>
                                                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                                                    <SpreadsheetPreview data={sourceData} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Database className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Connection</h3>
                                <p className="text-sm text-slate-500 max-w-[200px]">
                                    Upload a file or connect a database to analyze your data here.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
