import { IsString, IsNotEmpty, IsInt, Min, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED',
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  sheetId: string;
}