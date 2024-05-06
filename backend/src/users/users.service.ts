import { ConflictException, Injectable } from '@nestjs/common';
import { SignUpDto } from 'src/auth/dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(signUpDto: SignUpDto) {
    const user = await this.findOneByEmail(signUpDto.email);
    
    if (user) throw new ConflictException('Email already registered');

    signUpDto.password = await this.hashPassword(signUpDto.password);

    return await this.repository.save(signUpDto);
  }

  async findOne(id: number) {
    return await this.repository.findOneBy({ id });
  }

  async findOneByEmail(email: string) {
    return await this.repository.findOneBy({ email });
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, storedPasswordHash: string) {
    return await bcrypt.compare(password, storedPasswordHash);
  }
}
