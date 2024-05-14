import { Wallet } from 'src/wallets/entities/wallet.entity';
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

@Entity({ name: 'addresses' })
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @ManyToMany(() => Wallet, (wallet) => wallet.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'wallets_addresses',
    joinColumn: {
      name: 'address_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'wallet_id',
      referencedColumnName: 'id',
    },
  })
  wallets: Wallet[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
