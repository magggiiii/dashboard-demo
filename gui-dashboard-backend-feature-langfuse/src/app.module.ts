import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ChartModule } from './modules/chart/chart.module';
import { ChatModule } from './modules/chat/chat.module';
import { FileModule } from './modules/file/file.module';
import { S3Module } from './modules/s3/s3.module';
import { CopilotkitModule } from './modules/copilotkit/copilotkit.module';
import { LangfuseModule } from './modules/langfuse/langfuse.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    DashboardModule,
    ChartModule,
    ChatModule,
    FileModule,
    S3Module,
    CopilotkitModule,
    LangfuseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
