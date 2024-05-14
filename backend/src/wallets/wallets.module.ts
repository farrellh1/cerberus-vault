import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { AddressesModule } from 'src/addresses/addresses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), AddressesModule],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
