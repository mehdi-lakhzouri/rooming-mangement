import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreateRoomDto, Gender } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { MoveMemberDto } from './dto/move-member.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async create(createRoomDto: CreateRoomDto) {
    try {
      const room = await this.prisma.room.create({
        data: createRoomDto,
        include: {
          sheet: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      this.websocketGateway.emitRoomCreated(room);
      return room;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Room name already exists for this gender and sheet');
      }
      throw error;
    }
  }

  async findAll(gender?: Gender) {
    const where = gender ? { gender } : {};
    
    return this.prisma.room.findMany({
      where,
      include: {
        sheet: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        sheet: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        sheet: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    this.websocketGateway.emitRoomUpdated(updatedRoom);
    return updatedRoom;
  }

  async remove(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.members.length > 0) {
      throw new BadRequestException('Cannot delete room with members');
    }

    await this.prisma.room.delete({
      where: { id },
    });

    this.websocketGateway.emitRoomDeleted(id);
    return { message: 'Room deleted successfully' };
  }

  async joinRoom(roomId: string, joinRoomDto: JoinRoomDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if room exists and has space
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          members: true,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.members.length >= room.capacity) {
        throw new BadRequestException('Room is full');
      }

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          firstname: joinRoomDto.firstname,
          lastname: joinRoomDto.lastname,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            firstname: joinRoomDto.firstname,
            lastname: joinRoomDto.lastname,
          },
        });
      }

      // Check if user is already in this room
      const existingMembership = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: user.id,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('User already in this room');
      }

      // Create membership
      const membership = await prisma.roomMember.create({
        data: {
          roomId,
          userId: user.id,
        },
        include: {
          user: true,
        },
      });

      // Update room if it becomes full
      const updatedMemberCount = room.members.length + 1;
      const shouldMarkFull = updatedMemberCount >= room.capacity;

      if (shouldMarkFull) {
        await prisma.room.update({
          where: { id: roomId },
          data: { isFull: true },
        });
      }

      // Get updated room data
      const updatedRoom = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          sheet: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      this.websocketGateway.emitMemberJoined(roomId, membership);
      this.websocketGateway.emitRoomUpdated(updatedRoom);

      return updatedRoom;
    });
  }

  async getMembers(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room.members;
  }

  async removeMember(roomId: string, memberId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const membership = await prisma.roomMember.findUnique({
        where: { id: memberId },
      });

      if (!membership || membership.roomId !== roomId) {
        throw new NotFoundException('Member not found in this room');
      }

      await prisma.roomMember.delete({
        where: { id: memberId },
      });

      // Update room status
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          members: true,
        },
      });

      if (room && room.isFull && room.members.length < room.capacity) {
        await prisma.room.update({
          where: { id: roomId },
          data: { isFull: false },
        });
      }

      // Get updated room data
      const updatedRoom = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          sheet: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      this.websocketGateway.emitMemberLeft(roomId, memberId);
      this.websocketGateway.emitRoomUpdated(updatedRoom);

      return { message: 'Member removed successfully' };
    });
  }

  async getAvailableRoomsForMember(memberId: string) {
    // Find the member's current room to get gender and sheet constraints
    const currentMembership = await this.prisma.roomMember.findUnique({
      where: { id: memberId },
      include: {
        room: {
          include: {
            sheet: true,
          },
        },
      },
    });

    if (!currentMembership) {
      throw new NotFoundException('Member not found');
    }

    const currentRoom = currentMembership.room;

    // Find all available rooms with the same gender and sheet, excluding current room
    const availableRooms = await this.prisma.room.findMany({
      where: {
        sheetId: currentRoom.sheetId,
        gender: currentRoom.gender,
        isFull: false,
        id: { not: currentRoom.id },
      },
      include: {
        members: true,
        sheet: true,
      },
    });

    // Filter out rooms that are actually full (capacity check)
    return availableRooms.filter(room => room.members.length < room.capacity);
  }

  async moveMember(memberId: string, moveMemberDto: MoveMemberDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Find the current membership with detailed room and sheet information
      const currentMembership = await prisma.roomMember.findUnique({
        where: { id: memberId },
        include: {
          room: {
            include: {
              sheet: true,
            },
          },
          user: true,
        },
      });

      if (!currentMembership) {
        throw new NotFoundException('Member not found');
      }

      const sourceRoomId = currentMembership.roomId;
      const destinationRoomId = moveMemberDto.destinationRoomId;
      const sourceRoom = currentMembership.room;

      // Check if destination room exists with full details
      const destinationRoom = await prisma.room.findUnique({
        where: { id: destinationRoomId },
        include: {
          members: true,
          sheet: true,
        },
      });

      if (!destinationRoom) {
        throw new NotFoundException('Destination room not found');
      }

      // Validate same sheet constraint
      if (sourceRoom.sheetId !== destinationRoom.sheetId) {
        throw new BadRequestException('Cannot move member between different sheets');
      }

      // Validate gender compatibility
      if (sourceRoom.gender !== destinationRoom.gender) {
        throw new BadRequestException(
          `Cannot move ${sourceRoom.gender.toLowerCase()} member to ${destinationRoom.gender.toLowerCase()} room`
        );
      }

      // Check if destination room is full
      if (destinationRoom.members.length >= destinationRoom.capacity) {
        throw new BadRequestException('Destination room is full');
      }

      // Check if user is already in the destination room
      const existingMembership = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: destinationRoomId,
            userId: currentMembership.userId,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('Member is already in the destination room');
      }

      // Update the membership to point to the new room
      await prisma.roomMember.update({
        where: { id: memberId },
        data: { roomId: destinationRoomId },
      });

      // Update source room status (might no longer be full)
      const updatedSourceRoomData = await prisma.room.findUnique({
        where: { id: sourceRoomId },
        include: {
          members: true,
        },
      });

      if (updatedSourceRoomData && updatedSourceRoomData.isFull && updatedSourceRoomData.members.length < updatedSourceRoomData.capacity) {
        await prisma.room.update({
          where: { id: sourceRoomId },
          data: { isFull: false },
        });
      }

      // Update destination room status (might now be full)
      const updatedDestinationRoom = await prisma.room.findUnique({
        where: { id: destinationRoomId },
        include: {
          members: true,
        },
      });

      if (updatedDestinationRoom && updatedDestinationRoom.members.length >= updatedDestinationRoom.capacity) {
        await prisma.room.update({
          where: { id: destinationRoomId },
          data: { isFull: true },
        });
      }

      // Get updated data for both rooms
      const [updatedSourceRoom, finalDestinationRoom] = await Promise.all([
        prisma.room.findUnique({
          where: { id: sourceRoomId },
          include: {
            sheet: true,
            members: {
              include: {
                user: true,
              },
            },
          },
        }),
        prisma.room.findUnique({
          where: { id: destinationRoomId },
          include: {
            sheet: true,
            members: {
              include: {
                user: true,
              },
            },
          },
        }),
      ]);

      // Emit WebSocket events
      this.websocketGateway.emitMemberLeft(sourceRoomId, memberId);
      this.websocketGateway.emitMemberJoined(destinationRoomId, {
        ...currentMembership,
        roomId: destinationRoomId,
      });
      this.websocketGateway.emitRoomUpdated(updatedSourceRoom);
      this.websocketGateway.emitRoomUpdated(finalDestinationRoom);

      return {
        message: 'Member moved successfully',
        member: {
          ...currentMembership,
          roomId: destinationRoomId,
          room: finalDestinationRoom,
        },
        sourceRoom: updatedSourceRoom,
        destinationRoom: finalDestinationRoom,
      };
    });
  }

  async markFull(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id },
      data: { isFull: true },
      include: {
        sheet: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    this.websocketGateway.emitRoomUpdated(updatedRoom);
    return updatedRoom;
  }
}