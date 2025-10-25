import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, Gender } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  findAll(@Query('gender') gender?: Gender) {
    return this.roomsService.findAll(gender);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }

  @Post(':id/join')
  joinRoom(@Param('id') id: string, @Body() joinRoomDto: JoinRoomDto) {
    return this.roomsService.joinRoom(id, joinRoomDto);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.roomsService.getMembers(id);
  }

  @Delete(':roomId/members/:memberId')
  removeMember(
    @Param('roomId') roomId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.roomsService.removeMember(roomId, memberId);
  }

  @Patch(':id/mark-full')
  markFull(@Param('id') id: string) {
    return this.roomsService.markFull(id);
  }
}