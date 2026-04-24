
import { Controller, Post, Get, Req, Res, Logger } from '@nestjs/common';
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime';
import { ConfigService } from '@nestjs/config';
import { createOpenAI } from '@ai-sdk/openai';
import OpenAI from 'openai';
import { LangfuseService } from '../langfuse/langfuse.service';
import { observeOpenAI } from 'langfuse';
import { logger as appLogger } from '../../utils/logger';

@Controller('copilotkit')
export class CopilotkitController {
    private readonly logger = new Logger(CopilotkitController.name);

    constructor(
        private configService: ConfigService,
        private langfuseService: LangfuseService,
    ) { }

    @Get('instructions')
    async getInstructions() {
        return {
            instructions: await this.langfuseService.getPrompt('dashboard-assistant-instructions', "You are a helpful Dashboard Assistant.")
        };
    }

    @Post()
    async handleRequest(@Req() req: any, @Res() res: any) {
        this.logger.log(`CopilotRuntime: Received POST request ${req.url}`);
        this.logger.debug(`Request Body: ${JSON.stringify(req.body).substring(0, 500)}`);

        try {
            // This custom fetch intercepts all requests sent by Vercel AI SDK or CopilotKit
            // to sanitize them for strict OpenAI-compatible gateways (like Groq via Bifrost).
            const customFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
                let urlStr = url.toString();

                // Force URL to chat/completions if the AI SDK erroneously targets /responses
                if (urlStr.endsWith('/responses')) {
                    urlStr = urlStr.replace('/responses', '/chat/completions');
                }

                if (init && init.body && typeof init.body === 'string') {
                    try {
                        let bodyObj = JSON.parse(init.body);

                        // If it used the 'responses' API shape (input instead of messages), fix it
                        if (bodyObj.input && !bodyObj.messages) {
                            bodyObj.messages = bodyObj.input;
                            delete bodyObj.input;
                        }

                        if (bodyObj.messages) {
                            bodyObj.messages = bodyObj.messages.map((m: any) => {
                                const newMsg = { ...m };
                                // Remove 'name' from non-tool roles
                                if (newMsg.role !== 'function' && newMsg.role !== 'tool' && newMsg.name) {
                                    delete newMsg.name;
                                }
                                // Convert array content back to string
                                if (Array.isArray(newMsg.content)) {
                                    newMsg.content = newMsg.content.map((c: any) => c.text || '').join('\n');
                                }
                                // Replace developer role with system
                                if (newMsg.role === 'developer') {
                                    newMsg.role = 'system';
                                }
                                return newMsg;
                            });
                        }

                        if (bodyObj.stream_options) delete bodyObj.stream_options;
                        if (bodyObj.max_completion_tokens) {
                            bodyObj.max_tokens = bodyObj.max_completion_tokens;
                            delete bodyObj.max_completion_tokens;
                        }
                        if (bodyObj.parallel_tool_calls !== undefined && (!bodyObj.tools || bodyObj.tools.length === 0)) {
                            delete bodyObj.parallel_tool_calls;
                        }

                        init.body = JSON.stringify(bodyObj);

                        appLogger.debug('--- INTERCEPTED AI GATEWAY PAYLOAD ---');
                        appLogger.debug(JSON.stringify(bodyObj, null, 2));
                    } catch (e) {
                        appLogger.error('Failed to parse and sanitize AI payload', e);
                    }
                }

                return fetch(urlStr, init as any);
            };

            const modelName = this.configService.get<string>('BIFROST_MODEL') || "llama-3.3-70b-versatile";

            const openaiProvider = createOpenAI({
                baseURL: this.configService.get<string>('BIFROST_BASE_URL'),
                apiKey: this.configService.get<string>('BIFROST_API_KEY'),
                fetch: customFetch,
            });

            // Base OpenAI client for CopilotKit's internal setup (also using custom fetch)
            let openai = new OpenAI({
                baseURL: this.configService.get<string>('BIFROST_BASE_URL'),
                apiKey: this.configService.get<string>('BIFROST_API_KEY'),
                fetch: customFetch,
            });

            // Wrap OpenAI with Langfuse tracing if enabled
            if (this.langfuseService.getClient()) {
                openai = observeOpenAI(openai);
            }

            const serviceAdapter = new OpenAIAdapter({
                openai: openai as any,
                model: modelName,
            });

            // IMPORTANT: Force CopilotKit agents to strictly use the Chat API and our custom fetch.
            // This prevents the AI SDK from guessing the API endpoint and hitting `/responses`
            serviceAdapter.getLanguageModel = () => openaiProvider.chat(modelName);

            const runtime = new CopilotRuntime();

            const handler = copilotRuntimeNodeHttpEndpoint({
                endpoint: '/copilotkit',
                runtime,
                serviceAdapter,
            });

            this.logger.log("Passing request to CopilotRuntime handler...");
            const response = await handler(req, res);
            this.logger.log("CopilotRuntime handler execution completed.");
            return response;
        } catch (error: any) {
            this.logger.error("CopilotRuntime: Error handling request", error);
            res.status(500).json({ error: error.message });
        }
    }
}
