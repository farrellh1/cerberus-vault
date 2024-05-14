import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}
