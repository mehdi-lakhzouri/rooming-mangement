import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.roomMember.findMany({
      include: {
        user: true,
        room: {
          include: {
            sheet: true,
          },
        },
      },
    });
  }

  async getAnalytics() {
    const totalMembers = await this.prisma.roomMember.count();
    const totalRooms = await this.prisma.room.count();
    const totalCapacity = await this.prisma.room.aggregate({
      _sum: {
        capacity: true,
      },
    });

    const roomsByGender = await this.prisma.room.groupBy({
      by: ['gender'],
      _count: {
        _all: true,
      },
    });

    const occupancyRate = totalCapacity._sum.capacity
      ? (totalMembers / totalCapacity._sum.capacity) * 100
      : 0;

    return {
      totalMembers,
      totalRooms,
      totalCapacity: totalCapacity._sum.capacity || 0,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      roomsByGender,
    };
  }
}