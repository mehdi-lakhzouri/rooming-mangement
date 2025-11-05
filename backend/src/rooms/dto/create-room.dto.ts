import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  Max, 
  IsEnum, 
  Matches, 
  Length 
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class CreateRoomDto {
  @IsString({ message: 'Room name must be a string' })
  @IsNotEmpty({ message: 'Room name is required' })
  @Length(1, 100, { message: 'Room name must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_().,&]+$/, {
    message: 'Room name can only contain letters, numbers, spaces, hyphens, underscores, parentheses, dots, commas, and ampersands'
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(20, { message: 'Capacity cannot exceed 20' })
  capacity: number;

  @IsEnum(Gender, { message: 'Gender must be either MALE or FEMALE' })
  gender: Gender;

  @IsString({ message: 'Sheet ID must be a string' })
  @IsNotEmpty({ message: 'Sheet ID is required' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Sheet ID contains invalid characters'
  })
  sheetId: string;
}