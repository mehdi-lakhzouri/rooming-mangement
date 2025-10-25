import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { CreateSheetDto } from './dto/create-sheet.dto';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Post()
  create(@Body() createSheetDto: CreateSheetDto) {
    return this.sheetsService.create(createSheetDto);
  }

  @Get()
  findAll() {
    return this.sheetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sheetsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSheetDto: CreateSheetDto) {
    return this.sheetsService.update(id, updateSheetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sheetsService.remove(id);
  }
}