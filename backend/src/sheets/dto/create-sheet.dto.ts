import { 
  IsString, 
  IsNotEmpty, 
  Length, 
  Matches 
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSheetDto {
  @IsString({ message: 'Sheet name must be a string' })
  @IsNotEmpty({ message: 'Sheet name is required' })
  @Length(3, 100, { message: 'Sheet name must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_&()]+$/, {
    message: 'Sheet name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and parentheses'
  })
  @Transform(({ value }) => value?.trim())
  name: string;
}