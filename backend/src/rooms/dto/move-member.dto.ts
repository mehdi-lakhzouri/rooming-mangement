import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class MoveMemberDto {
  @IsString({ message: 'Destination room ID must be a string' })
  @IsNotEmpty({ message: 'Destination room ID is required' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Destination room ID contains invalid characters'
  })
  destinationRoomId: string;
}