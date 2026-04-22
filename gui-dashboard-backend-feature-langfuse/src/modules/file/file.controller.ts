import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private fileService: FileService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Query('dashboardId') dashboardId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = await this.fileService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
      req.user.id,
      dashboardId || undefined,
    );

    return uploadedFile;
  }

  @Get()
  findAll(@Request() req: any) {
    return this.fileService.findAllByUser(req.user.id);
  }

  @Get('dashboard/:dashboardId')
  findAllByDashboard(@Param('dashboardId') dashboardId: string, @Request() req: any) {
    return this.fileService.findAllByDashboard(dashboardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.fileService.findOne(id, req.user.id);
  }

  @Get(':id/url')
  getSignedUrl(@Param('id') id: string, @Request() req: any) {
    return this.fileService.getSignedUrl(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: { dashboardId?: string },
    @Request() req: any,
  ) {
    return this.fileService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.fileService.delete(id, req.user.id);
  }
}
