import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Langfuse } from 'langfuse';

@Injectable()
export class LangfuseService implements OnModuleInit {
    private readonly logger = new Logger(LangfuseService.name);
    private langfuse: Langfuse;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const publicKey = this.configService.get<string>('LANGFUSE_PUBLIC_KEY');
        const secretKey = this.configService.get<string>('LANGFUSE_SECRET_KEY');
        const host = this.configService.get<string>('LANGFUSE_HOST');

        if (publicKey && secretKey) {
            this.langfuse = new Langfuse({
                publicKey,
                secretKey,
                baseUrl: host,
            });
            this.logger.log('Langfuse initialized successfully');
        } else {
            this.logger.warn('Langfuse credentials missing. Tracing and prompt management will be disabled.');
        }
    }

    getClient(): Langfuse | null {
        return this.langfuse || null;
    }

    async getPrompt(name: string, fallback?: string): Promise<string> {
        if (!this.langfuse) {
            return fallback || '';
        }

        try {
            const prompt = await this.langfuse.getPrompt(name);
            return prompt.prompt;
        } catch (error) {
            this.logger.error(`Error fetching prompt "${name}" from Langfuse:`, error);
            return fallback || '';
        }
    }
}
