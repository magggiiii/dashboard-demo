"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

interface CopilotChatContextType {
  chatMessages: any[];
  setChatMessages: (messages: any[]) => void;
  onNewCopilotMessage: (message: any) => void;
  restoreVersion: number;
}

const CopilotChatContext = createContext<CopilotChatContextType | undefined>(undefined);

export const CopilotChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatMessages, setChatMessagesState] = useState<any[]>([]);
  const lastSavedRef = useRef<string>('');
  const [restoreVersion, setRestoreVersion] = useState(0);

  // Wrapper that bumps the restore version — used for dashboard switch / full load
  const setChatMessages = useCallback((messages: any[]) => {
    setChatMessagesState(messages);
    setRestoreVersion(v => v + 1);
    // Reset dedup so new appends after a load are tracked correctly
    lastSavedRef.current = '';
  }, []);

  const onNewCopilotMessage = useCallback((message: any) => {
    const key = `${message.role}-${message.content.substring(0, 50)}`;
    if (key !== lastSavedRef.current) {
      console.log('New copilot message received:', message.role, message.content.substring(0, 30));
      lastSavedRef.current = key;

      // PRESERVE RAW TAGS for the Tag Parser in page.tsx
      // The UI filtering is already handled in ChatDataSidebar.tsx using FilteredAssistantMessage
      setChatMessagesState(prev => [...prev, message]);
    }
  }, []);

  return (
    <CopilotChatContext.Provider value={{ chatMessages, setChatMessages, onNewCopilotMessage, restoreVersion }}>
      {children}
    </CopilotChatContext.Provider>
  );
};

export const useCopilotChatMessages = () => {
  const context = useContext(CopilotChatContext);
  if (!context) {
    throw new Error('useCopilotChatMessages must be used within CopilotChatProvider');
  }
  return context;
};

