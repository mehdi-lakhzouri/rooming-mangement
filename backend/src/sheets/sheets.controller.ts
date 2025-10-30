import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
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

  @Post('validate-code')
  @HttpCode(HttpStatus.OK)
  async validateCode(@Body() body: { code: string }) {
    const { code } = body;
    
    if (!code) {
      throw new UnauthorizedException('Access code is required');
    }

    const result = await this.sheetsService.validateCode(code);
    
    if (!result) {
      throw new UnauthorizedException('Invalid access code');
    }

    return { sheetId: result.sheetId };
  }

  @Get('admin/with-codes')
  findAllWithCodes() {
    // This would be protected with admin authentication in a real app
    return this.sheetsService.findAllWithCodes();
  }

  @Get('admin/:id/with-code')
  getSheetWithCode(@Param('id') id: string) {
    // This would be protected with admin authentication in a real app
    return this.sheetsService.getSheetWithCode(id);
  }
}