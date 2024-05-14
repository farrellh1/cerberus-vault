import { Address } from 'src/addresses/entities/address.entity';
import { NetworkType } from 'src/commons/enums';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  address?: string;

  @Column({
    enum: NetworkType,
    enumName: 'NetworkType',
    type: 'enum',
  })
  network: NetworkType;

  @ManyToMany(() => Address, (address) => address.wallets, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable({
    name: 'wallets_addresses',
    joinColumn: {
      name: 'wallet_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'address_id',
      referencedColumnName: 'id',
    },
  })
  addresses: Address[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
