import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Addresses')
@Controller({
  version: '1',
  path: 'addresses',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @ApiBody({ type: CreateAddressDto })
  @Post()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @ApiQuery({ type: FindAllQueryDto })
  @Get()
  findAll(@Query() query: FindAllQueryDto) {
    return this.addressesService.findAll(query);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }
}
