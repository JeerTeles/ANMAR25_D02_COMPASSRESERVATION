import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserValidationService {
  constructor(private readonly prisma: PrismaService) {}
  async validateUserFields(dto: UpdateUserDto) {
    if (dto.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) throw new ConflictException('Email already registered');
    }

    if (dto.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (phoneExists) throw new ConflictException('Phone already registered');
    }
  }

  async getUserOrFail(id: number, select?: Prisma.UserSelect): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: select,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async ensureUserIsActive(user: User) {
    if (user.status === 'INACTIVE') {
      throw new BadRequestException('User is already inactive');
    }
  }
}
