import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { AddressesService } from 'src/addresses/addresses.service';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private readonly repository: Repository<Wallet>,
    private readonly addressesService: AddressesService,
  ) {}
  async create(createWalletDto: CreateWalletDto) {
    const createAddressDto: CreateAddressDto[] = createWalletDto.addresses.map(
      (address) => ({
        address,
      }),
    );
    const addresses = await this.addressesService.createMany(createAddressDto);
    
    return await this.repository.save({
      name: createWalletDto.name,
      network: createWalletDto.network,
      addresses: addresses.generatedMaps,
    });
  }

  async findAll(query: FindAllQueryDto) {
    return await this.repository.findBy({
      addresses: {
        address: query.ownerAddress,
      },
    });
  }

  async findOne(id: number) {
    const wallet = await this.repository.findOneBy({ id });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async update(id: number, updateWalletDto: UpdateWalletDto) {
    const wallet = await this.findOne(id);
    return await this.repository.save({
      ...wallet,
      name: updateWalletDto.name,
    });
  }
}
