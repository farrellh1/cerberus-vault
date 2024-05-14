import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
} from 'class-validator';
import { NetworkType } from 'src/commons/enums';

export class CreateWalletDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    type: NetworkType,
    enum: NetworkType,
    enumName: 'NetworkType',
  })
  @IsNotEmpty()
  @IsEnum(NetworkType)
  network: NetworkType;

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsEthereumAddress({
    each: true,
  })
  addresses: string[];
}
