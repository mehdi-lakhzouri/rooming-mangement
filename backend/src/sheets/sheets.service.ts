import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreateSheetDto } from './dto/create-sheet.dto';

@Injectable()
export class SheetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async create(createSheetDto: CreateSheetDto) {
    try {
      const sheet = await this.prisma.sheet.create({
        data: createSheetDto,
        include: {
          rooms: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      this.websocketGateway.emitSheetCreated(sheet);
      return sheet;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Sheet name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.sheet.findMany({
      include: {
        rooms: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const sheet = await this.prisma.sheet.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!sheet) {
      throw new NotFoundException('Sheet not found');
    }

    return sheet;
  }

  async update(id: string, updateSheetDto: CreateSheetDto) {
    const sheet = await this.prisma.sheet.findUnique({
      where: { id },
    });

    if (!sheet) {
      throw new NotFoundException('Sheet not found');
    }

    try {
      const updatedSheet = await this.prisma.sheet.update({
        where: { id },
        data: updateSheetDto,
        include: {
          rooms: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      return updatedSheet;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Sheet name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const sheet = await this.prisma.sheet.findUnique({
      where: { id },
    });

    if (!sheet) {
      throw new NotFoundException('Sheet not found');
    }

    await this.prisma.sheet.delete({
      where: { id },
    });

    this.websocketGateway.emitSheetDeleted(id);
    return { message: 'Sheet deleted successfully' };
  }
}