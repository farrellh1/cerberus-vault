import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Wallets')
@Controller({
  version: '1',
  path: 'wallets',
})
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @ApiBody({ type: CreateWalletDto })
  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(createWalletDto);
  }

  @ApiQuery({ type: FindAllQueryDto })
  @Get()
  findAll(@Query() query: FindAllQueryDto) {
    return this.walletsService.findAll(query);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(+id);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateWalletDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletsService.update(+id, updateWalletDto);
  }
}
