import { ApiProperty } from '@nestjs/swagger';

export class UserSearchResultDto {
  @ApiProperty({ description: 'ID do usuário' })
  id: number;

  @ApiProperty({ description: 'Nome do usuário' })
  name: string;

  @ApiProperty({ description: 'Email do usuário' })
  email: string;

  @ApiProperty({ description: 'Papel do usuário' })
  role: string;

  @ApiProperty({ description: 'ID da localização do usuário', nullable: true })
  locationId: number | null;
}
