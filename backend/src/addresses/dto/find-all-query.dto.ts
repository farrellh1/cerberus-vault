import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class FindAllQueryDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress: string;
}
