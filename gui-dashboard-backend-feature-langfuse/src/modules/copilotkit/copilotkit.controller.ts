import { Controller, Post, Get, Req, Res, Logger } from '@nestjs/common';
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LangfuseService } from '../langfuse/langfuse.service';
import { observeOpenAI } from 'langfuse';

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
            let openai = new OpenAI({
                baseURL: this.configService.get<string>('BIFROST_BASE_URL'),
                apiKey: this.configService.get<string>('BIFROST_API_KEY'),
            });

            // Wrap OpenAI with Langfuse tracing if enabled
            if (this.langfuseService.getClient()) {
                openai = observeOpenAI(openai);
            }

            const serviceAdapter = new OpenAIAdapter({
                openai: openai as any,
                model: this.configService.get<string>('BIFROST_MODEL') || "groq/llama-3.3-70b-versatile",
            });

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
