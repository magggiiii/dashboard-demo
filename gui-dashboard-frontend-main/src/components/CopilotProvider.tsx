"use client";

import React from 'react';
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const runtimeUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/copilotkit`
        : "http://localhost:3500/copilotkit";

    return (
        <CopilotKit
            runtimeUrl={runtimeUrl}
            showDevConsole={true}
        >
            {children}
        </CopilotKit>
    );
};
