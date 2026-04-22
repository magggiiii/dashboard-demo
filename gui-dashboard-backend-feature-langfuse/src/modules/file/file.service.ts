import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
  ) { }

  async upload(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    size: number,
    userId: string,
    dashboardId?: string,
  ): Promise<File> {
    const s3Key = await this.s3Service.uploadFile(
      fileBuffer,
      fileName,
      contentType,
      userId,
    );

    const url = this.s3Service.getFileUrl(s3Key);

    const file = this.fileRepository.create({
      name: fileName,
      s3Key,
      url,
      contentType,
      size,
      userId,
      dashboardId,
    });

    return this.fileRepository.save(file);
  }

  async findAllByUser(userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByDashboard(dashboardId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { dashboardId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id, userId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async delete(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id, userId);
    await this.s3Service.deleteFile(file.s3Key);
    await this.fileRepository.remove(file);
  }

  async getSignedUrl(id: string, userId: string): Promise<string> {
    const file = await this.findOne(id, userId);
    return this.s3Service.getSignedUrl(file.s3Key);
  }

  async update(id: string, userId: string, updateData: { dashboardId?: string }): Promise<File> {
    const file = await this.findOne(id, userId);

    if (updateData.dashboardId !== undefined) {
      file.dashboardId = updateData.dashboardId;
    }

    return this.fileRepository.save(file);
  }
}
