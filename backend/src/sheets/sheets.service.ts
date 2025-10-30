import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreateSheetDto } from './dto/create-sheet.dto';

@Injectable()
export class SheetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  private generateSheetCode(): string {
    const prefix = process.env.SHEET_CODE_PREFIX || 'SDC';
    const randomNumber = Math.floor(Math.random() * 9000) + 1000; // 4 digit number (1000-9999)
    return `${prefix}-${randomNumber}`;
  }

  private async ensureUniqueCode(): Promise<string> {
    let code = this.generateSheetCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existingSheet = await this.prisma.sheet.findUnique({
        where: { code }
      });

      if (!existingSheet) {
        return code;
      }

      code = this.generateSheetCode();
      attempts++;
    }

    throw new ConflictException('Unable to generate unique sheet code');
  }

  async create(createSheetDto: CreateSheetDto) {
    try {
      const code = await this.ensureUniqueCode();
      
      const sheet = await this.prisma.sheet.create({
        data: {
          ...createSheetDto,
          code,
        },
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
      select: {
        id: true,
        name: true,
        createdAt: true,
        // code excluded for security
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

  async findAllWithCodes() {
    // Admin-only method that includes codes
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

  async validateCode(code: string): Promise<{ sheetId: string } | null> {
    const sheet = await this.prisma.sheet.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!sheet) {
      return null;
    }

    return { sheetId: sheet.id };
  }

  async getSheetWithCode(id: string) {
    // Admin method that includes the code
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
}