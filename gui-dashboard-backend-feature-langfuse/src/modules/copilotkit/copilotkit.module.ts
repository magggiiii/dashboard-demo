import { Module } from '@nestjs/common';
import { CopilotkitController } from './copilotkit.controller';

@Module({
    controllers: [CopilotkitController],
})
export class CopilotkitModule { }
