"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GenUIRuntime } from '@/components/GenUIRuntime';
import { useDashboard } from '@/hooks/useDashboard';
import { safeJsonParse } from '@/utils/json-utils';
import { LayoutDashboard, Grid3x3, MessageSquare, Save, FolderOpen, Loader2, User, LogOut, ChevronDown } from 'lucide-react';
import { DataConnectionSidebar, ConnectedSource } from '@/components/DataConnectionSidebar';
import { ChatDataSidebar } from '@/components/ChatDataSidebar';
import { EmptyStateLanding } from '@/components/EmptyStateLanding';
import { useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardResponse, fileApi } from '@/lib/dashboard';
import { chatApi, ChatMessage } from '@/lib/chat';
import { useAuth } from '@/context/AuthContext';
import { useCopilotChatMessages } from '@/context/CopilotChatContext';
import * as XLSX from 'xlsx';
import "@copilotkit/react-ui/styles.css";

const INITIAL_MESSAGE = "Hi there! 👋 What would you like to see or change on your dashboard?";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const { chatMessages: contextChatMessages, setChatMessages: setContextChatMessages } = useCopilotChatMessages();
  const [isDataSidebarOpen, setIsDataSidebarOpen] = useState(false);
  const [allParsedData, setAllParsedData] = useState<{ sourceId: string; data: Record<string, unknown>[] }[]>([]);
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([]);
  const [savedDashboards, setSavedDashboards] = useState<DashboardResponse[]>([]);
  const [currentDashboardId, setCurrentDashboardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const isLoadingDashboardRef = useRef(false);


  // Merge all parsed data into a single array for useDashboard and AI analysis
  const mergedParsedData = React.useMemo(() => {
    return allParsedData.flatMap(item =>
      item.data.map(row => ({
        ...row,
        __source: connectedSources.find(s => s.id === item.sourceId)?.name || 'Unknown'
      }))
    );
  }, [allParsedData, connectedSources]);

  // useDashboard now handles data analysis logic internally via consolidated actions
  const { dashboard, updateDashboard, saveDashboard, updateDashboardToDb, loadDashboard, getAllDashboards, deleteDashboard, prepareElement } = useDashboard({ parsedData: mergedParsedData });

  // Simplified Tag Parser for updateDashboardUI
  const processedTags = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!contextChatMessages || contextChatMessages.length === 0) return;

    const lastMessage = contextChatMessages[contextChatMessages.length - 1];
    if (lastMessage.role !== 'assistant' || !lastMessage.content) return;

    // Regex to find tags: matches until a brace followed by </function> or end-of-string/next-tag
    // Hyper-robust regex to catch updateDashboardUI tags even if squashed or malformed
    const tagRegex = /<function(?:[./\(])(updateDashboardUI).*?({[\s\S]*?})\s*(?:<\/function>|(?=<function|$)|>)/g;
    let match;

    while ((match = tagRegex.exec(lastMessage.content)) !== null) {
      const tagContent = match[0];
      const jsonArgs = match[2];

      // Unique key for this specific tag execution to avoid loops
      // Include time-bucketed ID to allow the same command in different user turns
      const tagKey = `${lastMessage.id || 'new'}-${tagContent}`;

      if (!processedTags.current.has(tagKey)) {
        console.log("Tag Parser - Found tag:", tagContent);

        // Robust JSON extraction using our utility
        const args = safeJsonParse(jsonArgs, null);

        if (args) {
          console.log("Tag Parser - Parsed args:", args);
          try {
            if (args.action === "remove") {
              updateDashboard("remove", undefined, args.elementId);
            } else {
              // FOR ADD ACTIONS: If no ID is provided, create a unique one to avoid silent overwrites
              if (args.action === 'add' && !args.elementId) {
                args.elementId = `${args.elementType || 'el'}-${Date.now()}`;
              }
              const element = prepareElement(args, mergedParsedData);
              console.log("Tag Parser - Prepared element:", element.id, element.title);
              updateDashboard(args.action || "add", element, args.elementId || element.id);
            }

            processedTags.current.add(tagKey);
            console.log("Tag Parser - Successfully executed action:", args.action);
          } catch (e) {
            console.error("Tag Parser - Failed to execute action:", e);
          }
        } else {
          console.error("Tag Parser - Failed to parse JSON tag:", jsonArgs);
        }
      }
    }
  }, [contextChatMessages, mergedParsedData, updateDashboard, prepareElement]);

  const loadDashboardsList = async () => {
    try {
      setIsLoadingList(true);
      const dashboards = await getAllDashboards();
      setSavedDashboards(dashboards);
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Auto-save when dashboard elements change
  useEffect(() => {
    if (!currentDashboardId || dashboard.elements.length === 0 || isLoadingDashboardRef.current) return;

    const timer = setTimeout(async () => {
      try {
        await updateDashboardToDb(currentDashboardId, undefined, undefined, connectedSources);
        console.log('Auto-saved dashboard with connected sources');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [dashboard.elements, dashboard.layout, currentDashboardId, connectedSources]);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoadingList(true);
        const dashboards = await getAllDashboards();
        setSavedDashboards(dashboards);

        // Auto-load the first dashboard if exists
        if (dashboards.length > 0) {
          const firstDashboard = dashboards[0];
          console.log('Auto-loading first dashboard:', firstDashboard.id, firstDashboard.name);

          // Set ID and Name before loading content to ensure consistency
          setCurrentDashboardId(firstDashboard.id);
          setDashboardName(firstDashboard.name);

          await loadDashboard(firstDashboard.id);

          // Load connected sources and file data if exists
          if (firstDashboard.connectedSources && firstDashboard.connectedSources.length > 0) {
            const sources = firstDashboard.connectedSources;
            // Load data for each connected file source before setting state to avoid UI flicker
            const dataToLoad = [];
            for (const source of sources) {
              if (source.type === 'file' && source.fileId) {
                const fileData = await loadFileData(source.fileId, source.name);
                dataToLoad.push({ sourceId: source.id, data: fileData });
              }
            }
            setConnectedSources(sources);
            setAllParsedData(dataToLoad);
          } else if (firstDashboard.connectedSource) {
            // Legacy support for single connectedSource
            const source = firstDashboard.connectedSource;
            const dataToLoad = [];
            if (source.type === 'file' && source.fileId) {
              const fileData = await loadFileData(source.fileId, source.name);
              dataToLoad.push({ sourceId: source.id, data: fileData });
            }
            setConnectedSources([source]);
            setAllParsedData(dataToLoad);
          }

          // Load chat messages for the dashboard
          try {
            console.log('Loading messages for dashboard:', firstDashboard.id);
            const messages = await chatApi.getMessages(firstDashboard.id);
            console.log('Loaded chat messages:', messages);
            setChatMessages(messages);

            // Also populate context with loaded messages
            const contextMessages = messages.map((msg: ChatMessage) => ({
              role: msg.role,
              content: msg.content,
              metadata: msg.metadata,
            }));
            setContextChatMessages(contextMessages);

            // Sync the processing key so the last loaded message is not re-saved on refresh
            if (messages.length > 0) {
              const lastLoaded = messages[messages.length - 1];
              lastProcessedMessageKey.current = `${lastLoaded.role}-${lastLoaded.content?.substring(0, 100)}`;
              console.log("Init - Updated lastProcessedMessageKey to prevent duplication:", lastProcessedMessageKey.current);
            }
          } catch (e: any) {
            console.log('No chat messages or error:', e?.message || e);
          }

          console.log('Loaded existing dashboard:', firstDashboard.name);
        }
      } catch (error) {
        console.error('Failed to load dashboards:', error);
      } finally {
        setIsLoadingList(false);
      }
    };
    init();
  }, []);

  const loadFileData = async (fileId: string, fileName: string): Promise<Record<string, unknown>[]> => {
    try {
      const signedUrl = await fileApi.getSignedUrl(fileId);
      const response = await fetch(signedUrl);
      const arrayBuffer = await response.arrayBuffer();

      let data: Record<string, unknown>[] = [];

      if (fileName.endsWith('.json')) {
        const content = new TextDecoder().decode(arrayBuffer);
        const parsed = JSON.parse(content);
        data = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
      } else {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      }

      return data;
    } catch (error) {
      console.error('Failed to load file data:', error);
      return [];
    }
  };

  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) {
      alert('Please enter a dashboard name');
      return;
    }
    try {
      setIsSaving(true);
      if (currentDashboardId) {
        await updateDashboardToDb(currentDashboardId, dashboardName, undefined, connectedSources);
      } else {
        const result = await saveDashboard(dashboardName, undefined, connectedSources);
        setCurrentDashboardId(result.id);
      }
      await loadDashboardsList();
      alert('Dashboard saved successfully!');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      alert('Failed to save dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDashboard = async (id: string) => {
    try {
      isLoadingDashboardRef.current = true;

      // Reset context messages and key so stale messages are not re-saved to the new dashboard
      // Also store the ID we're loading to prevent race conditions
      const loadingDashboardId = id;
      setContextChatMessages([]);
      setSuggestions([]);
      lastProcessedMessageKey.current = null;

      const found = savedDashboards.find(d => d.id === id);
      setDashboardName(found?.name || '');
      setCurrentDashboardId(loadingDashboardId);

      const result = await loadDashboard(loadingDashboardId);
      console.log('Loaded dashboard data:', result);

      const connectedSourcesToUse = result.connectedSources || (result.connectedSource ? [result.connectedSource] : found?.connectedSources || (found?.connectedSource ? [found.connectedSource] : []));

      // Load connected sources if exists
      if (connectedSourcesToUse && connectedSourcesToUse.length > 0) {
        // Load data for each source BEFORE setting state to prevent preview disappearing
        const dataToLoad = [];
        for (const source of connectedSourcesToUse) {
          if (source.type === 'file' && source.fileId) {
            const fileData = await loadFileData(source.fileId, source.name);
            dataToLoad.push({ sourceId: source.id, data: fileData });
          }
        }
        setConnectedSources(connectedSourcesToUse);
        setAllParsedData(dataToLoad);
      } else {
        // Clear both if no connected sources
        setConnectedSources([]);
        setAllParsedData([]);
      }

      // Load chat messages for the dashboard
      try {
        const messages = await chatApi.getMessages(loadingDashboardId);
        setChatMessages(messages);

        // Also update context with loaded messages so they can be used
        const contextMessages = messages.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata,
        }));
        setContextChatMessages(contextMessages);

        console.log('Loaded chat messages:', messages);

        // Sync the processing key so the last loaded message is not re-saved
        if (messages.length > 0) {
          const lastLoaded = messages[messages.length - 1];
          lastProcessedMessageKey.current = `${lastLoaded.role}-${lastLoaded.content?.substring(0, 100)}`;
          console.log("Load Hook - Updated lastProcessedMessageKey to prevent re-saving:", lastProcessedMessageKey.current);
        }
      } catch (chatError) {
        console.log('No chat messages found');
        setChatMessages([]);
        setContextChatMessages([]);
      }

      setShowLoadMenu(false);
      setIsChatSidebarOpen(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      alert('Failed to load dashboard');
    } finally {
      isLoadingDashboardRef.current = false;
    }
  };

  const handleDeleteDashboard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    try {
      await deleteDashboard(id);
      if (currentDashboardId === id) {
        setCurrentDashboardId(null);
        setDashboardName('');
      }
      await loadDashboardsList();
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
    }
  };

  const handleNewDashboard = () => {
    setCurrentDashboardId(null);
    setDashboardName('');
    setChatMessages([]);
    setContextChatMessages([]);
    setConnectedSources([]);
    setAllParsedData([]);
    setSuggestions([]);
    updateDashboard('clear');
    setIsChatSidebarOpen(false);
  };

  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { appendMessage, visibleMessages, isLoading } = useCopilotChat();

  // Debug: Log context messages
  useEffect(() => {
    console.log('Context chatMessages changed:', contextChatMessages?.length, contextChatMessages?.map(m => ({ role: m?.role, content: m?.content?.substring(0, 20) })));
  }, [contextChatMessages]);


  // Save chat messages when new messages are added
  const handleSaveChatMessage = async (dashboardId: string, content: string, role: string) => {
    try {
      console.log('Saving message to dashboard:', dashboardId, { content: content.substring(0, 50), role });
      const savedMessage = await chatApi.addMessage(dashboardId, {
        content,
        role,
      });
      console.log('Message saved successfully:', savedMessage);

      // Refresh chat messages
      const messages = await chatApi.getMessages(dashboardId);
      console.log('Messages after save:', messages.length);
      setChatMessages(messages);
    } catch (error: any) {
      console.error('Failed to save chat message - Full error:', error);
      console.error('Response data:', error?.response?.data);
      console.error('Status:', error?.response?.status);
    }
  };


  const lastProcessedMessageKey = useRef<string | null>(null);

  // Save chat messages when new messages are added to the context
  useEffect(() => {
    // Skip if:
    // 1. No context messages
    // 2. Currently loading a dashboard (prevents race condition)
    // 3. No current dashboard ID set
    if (!contextChatMessages || contextChatMessages.length === 0) return;
    if (isLoadingDashboardRef.current) return;
    if (!currentDashboardId) {
      console.log('Save Hook - No dashboard ID, skipping message save to prevent duplicate creation');
      return;
    }

    const lastMessage = contextChatMessages[contextChatMessages.length - 1];

    // Skip saving the initial boilerplate message
    if (lastMessage.content === INITIAL_MESSAGE) {
      console.log("Saving Hook - Skipping initial boilerplate message");
      return;
    }

    const messageKey = `${lastMessage.role}-${lastMessage.content?.substring(0, 100)}`;

    if (messageKey !== lastProcessedMessageKey.current) {
      console.log("Saving Hook - Processing new message from context:", lastMessage.role);

      const saveInternal = async () => {
        try {
          const dashboardId = currentDashboardId;

          // Double-check we have a valid dashboard ID before saving
          if (!dashboardId) {
            console.log('Save Hook - No dashboard ID available, skipping save');
            return;
          }

          console.log("Saving Hook - SAVING message:", lastMessage.role, "to dashboard:", dashboardId);

          await handleSaveChatMessage(dashboardId, lastMessage.content || '', lastMessage.role);
          lastProcessedMessageKey.current = messageKey;
          console.log("Saving Hook - SUCCESS: Message saved");
        } catch (err) {
          console.error("Saving Hook - FAILURE in saveInternal:", err);
        }
      };

      saveInternal();
    }
  }, [contextChatMessages, currentDashboardId]);

  const [lastUploadedSource, setLastUploadedSource] = useState<string | null>(null);


  const handleDataUpload = async (data: Record<string, unknown>[], source: ConnectedSource) => {
    setConnectedSources(prev => {
      const updated = [...prev, source];
      // Auto-create or update dashboard with connected sources
      let dashboardId = currentDashboardId;
      if (!dashboardId) {
        const name = dashboardName || `Dashboard ${new Date().toLocaleDateString()}`;
        saveDashboard(name, undefined, updated).then(result => {
          setCurrentDashboardId(result.id);
          setDashboardName(name);

          // Update file with dashboardId if fileId exists
          if (source.fileId) {
            fileApi.update(source.fileId, { dashboardId: result.id });
          }
        });
      } else {
        updateDashboardToDb(dashboardId, undefined, undefined, updated).then(() => {
          // Update file with dashboardId if fileId exists
          if (source.fileId) {
            fileApi.update(source.fileId, { dashboardId });
          }
        });
      }
      return updated;
    });

    setAllParsedData(prev => [...prev, { sourceId: source.id, data }]);

    // Provide static dashboard suggestions that suit any uploaded file
    setSuggestions([
      "Generate a comprehensive dashboard for this data",
      "Show me key metrics and trends",
      "Create a detailed data summary table"
    ]);
  };

  const handleDataConnected = async (source: ConnectedSource, data: Record<string, unknown>[]) => {
    setConnectedSources(prev => {
      const updated = [...prev, source];
      // Auto-create or update dashboard with connected source
      if (currentDashboardId) {
        updateDashboardToDb(currentDashboardId, undefined, undefined, updated);
      } else {
        const name = dashboardName || `Dashboard ${new Date().toLocaleDateString()}`;
        saveDashboard(name, undefined, updated).then(result => {
          setCurrentDashboardId(result.id);
          setDashboardName(name);
        });
      }
      return updated;
    });

    setAllParsedData(prev => [...prev, { sourceId: source.id, data }]);

    setSuggestions([
      "Generate a comprehensive dashboard for this data",
      "Show me key metrics and trends",
      "Create a detailed data summary table"
    ]);
  };

  const handleDisconnectSource = async (sourceId: string) => {
    setConnectedSources(prev => {
      const updated = prev.filter(s => s.id !== sourceId);
      if (currentDashboardId) {
        updateDashboardToDb(currentDashboardId, undefined, undefined, updated);
      }
      if (updated.length === 0) {
        setSuggestions([]);
      }
      return updated;
    });

    setAllParsedData(prev => prev.filter(item => item.sourceId !== sourceId));
  };

  const handleStartChat = (message: string) => {
    // Sidebar should NOT open automatically at initial interaction
    // setIsChatSidebarOpen(true); 
    appendMessage(new TextMessage({
      role: MessageRole.User,
      content: message,
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.load-menu')) {
        setShowLoadMenu(false);
      }
      if (!target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl">
            <div className="w-full max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gen-UI Dashboard</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {dashboard.elements.length > 0 && (
                  <>
                    {/* Dashboard Name Input */}
                    <input
                      type="text"
                      placeholder="Dashboard name..."
                      value={dashboardName}
                      onChange={(e) => setDashboardName(e.target.value)}
                      className="px-3 py-1.5 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Save Button */}
                    <button
                      onClick={handleSaveDashboard}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </>
                )}

                {/* New Dashboard Button */}
                <button
                  onClick={handleNewDashboard}
                  className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                >
                  New
                </button>

                {/* Load Dropdown */}
                <div className="relative load-menu">
                  <button
                    onClick={() => setShowLoadMenu(!showLoadMenu)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Load
                  </button>

                  {showLoadMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {isLoadingList ? (
                        <div className="p-4 text-center text-slate-500">Loading...</div>
                      ) : savedDashboards.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">No saved dashboards</div>
                      ) : (
                        savedDashboards.map((dash) => (
                          <div
                            key={dash.id}
                            onClick={() => handleLoadDashboard(dash.id)}
                            className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                          >
                            <div>
                              <div className="font-medium text-sm text-slate-900">{dash.name}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(dash.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteDashboard(dash.id, e)}
                              className="text-red-500 hover:text-red-700 text-xs px-2"
                            >
                              Delete
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative profile-menu">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                  >
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'No email'}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-red-600 text-sm font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="w-full max-w-[1800px] mx-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dashboard.elements && dashboard.elements.length > 0 && dashboard.elements.map((element) => {
                if (!element) return null;
                return (
                  <div
                    key={element.id || `el-${Math.random()}`}
                    className={`
                      transition-all duration-500 ease-in-out
                      ${element.type === 'chart' || element.type === 'table'
                        ? 'col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2'
                        : 'col-span-1'}
                    `}
                  >
                    <GenUIRuntime data={element} />
                  </div>
                );
              })}
            </div>

            {/* 
              Show EmptyStateLanding if:
              1. No elements on dashboard AND (Not loading OR No data connected yet)
              This prevents the loader from flashing during initial CopilotKit boot before user interaction.
            */}
            {dashboard.elements.length === 0 && (!isLoading || connectedSources.length === 0) && (
              <EmptyStateLanding
                onDataUpload={handleDataUpload}
                onStartChat={handleStartChat}
                connectedSources={connectedSources}
                suggestions={suggestions}
                dashboardId={currentDashboardId || undefined}
              />
            )}

            {/* 
              Show Loader only if:
              1. No elements on dashboard AND
              2. Copilot is loading AND
              3. We actually have data to analyze (user has uploaded a file)
            */}
            {dashboard.elements.length === 0 && isLoading && connectedSources.length > 0 && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-700">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                  <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-xl border border-indigo-50">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Generating your dashboard...</h2>
                <p className="text-slate-500 text-lg animate-pulse">Analysis in progress. This will take just a few moments.</p>
              </div>
            )}
          </div>
        </main>

        {/* Floating Action Buttons - Bottom Right */}
        {dashboard.elements.length > 0 && (
          <div className={`
              fixed bottom-6 flex flex-row items-center gap-4 z-[60] transition-all duration-300
              ${isChatSidebarOpen ? 'right-[30rem]' : 'right-6'}
            `}>
            {/* Chat Toggle Button (Left of Bento) */}
            <button
              onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
              className={`
                  w-14 h-14 rounded-full shadow-2xl transition-all flex items-center justify-center group relative
                  hover:scale-110 active:scale-95 bg-slate-900 text-white
                  ${isChatSidebarOpen ? 'ring-4 ring-indigo-500/20' : 'hover:bg-indigo-600'}
                `}
              aria-label="Toggle chat assistant"
            >
              <MessageSquare className={`w-6 h-6 ${isChatSidebarOpen ? 'fill-current' : ''}`} />

              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {isChatSidebarOpen ? 'Close Assistant' : 'Open Assistant'}
              </div>
            </button>

            {/* Bento Icon (Data Connections) */}
            <button
              onClick={() => setIsDataSidebarOpen(true)}
              className="w-14 h-14 bg-slate-900 rounded-full shadow-2xl hover:shadow-indigo-200/50 hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative"
              aria-label="Open data connections"
            >
              <Grid3x3 className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />

              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                Data Connections
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Unified Chat & Data Sidebar */}
      <div className={`
        h-full bg-white transition-all duration-300 ease-in-out border-l border-slate-200
        ${isChatSidebarOpen ? 'w-[28rem] opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}
      `}>
        <div className="w-[28rem] h-full">
          <ChatDataSidebar
            allParsedData={allParsedData}
            connectedSources={connectedSources}
            onDisconnectSource={handleDisconnectSource}
            onClose={() => setIsChatSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Data Connection Sidebar */}
      <DataConnectionSidebar
        isOpen={isDataSidebarOpen}
        onClose={() => setIsDataSidebarOpen(false)}
        allParsedData={allParsedData}
        connectedSources={connectedSources}
        onSourceAdded={handleDataConnected}
        onSourceRemoved={handleDisconnectSource}
        currentDashboardId={currentDashboardId}
      />
    </div>
  );
}
