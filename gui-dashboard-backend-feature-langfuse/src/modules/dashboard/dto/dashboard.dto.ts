import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class ConnectedSourceDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: 'file' | 'sheet';

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  fileId?: string;

  @IsString()
  @IsOptional()
  createdAt?: string;
}

export class CreateDashboardDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  connectedSource?: ConnectedSourceDto | null;

  @IsOptional()
  connectedSources?: ConnectedSourceDto[];
}

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  connectedSource?: ConnectedSourceDto | null;

  @IsOptional()
  connectedSources?: ConnectedSourceDto[];
}
