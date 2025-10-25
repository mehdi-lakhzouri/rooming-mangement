import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSheetDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}