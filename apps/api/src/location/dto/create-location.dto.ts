import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state: string;
}
