import { 
  IsString, 
  IsNotEmpty, 
  Matches, 
  Length 
} from 'class-validator';
import { Transform } from 'class-transformer';

export class JoinRoomDto {
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
  })
  @Transform(({ value }) => value?.trim())
  firstname: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/, {
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
  })
  @Transform(({ value }) => value?.trim())
  lastname: string;
}