import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource } from '@prisma/client';

@Injectable()
export class ResourceValidationService {
  constructor(private readonly prisma: PrismaService) {}
  async validateResourceFields(dto: UpdateResourceDto) {
    if (dto.name) {
      const nameExists = await this.prisma.resource.findUnique({
        where: { name: dto.name },
      });
      if (nameExists)
        throw new ConflictException('Resource already registered');
    }
  }

  async getResourceOrFail(id: number): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({ where: { id } });

    if (!resource) throw new NotFoundException('Resource not found');

    return resource;
  }

  async ensureResourceIsActive(resource: Resource) {
    if (resource.status === 'INACTIVE') {
      throw new BadRequestException('Resource is already inactive');
    }
  }
}
