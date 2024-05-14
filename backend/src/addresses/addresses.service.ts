import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private readonly repository: Repository<Address>,
  ) {}
  async create(createAddressDto: CreateAddressDto) {
    const address = await this.repository.findOneBy({
      address: createAddressDto.address,
    });
    if (address) return address;

    return await this.repository.save(createAddressDto);
  }

  async createMany(addresses: CreateAddressDto[]) {
    return await this.repository.upsert(addresses, ['address']);
  }

  async findAll(query: FindAllQueryDto) {
    return await this.repository.find({
      where: { wallets: { address: query.walletAddress } },
    });
  }

  async remove(id: number) {
    const address = await this.repository.findOneBy({ id });
    if (!address) throw new NotFoundException('Address not found');

    return await this.repository.softRemove(address)
  }
}
