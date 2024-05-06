import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOneByEmail(signInDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await this.usersService.comparePasswords(
      signInDto.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return await this.generateToken(user);
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.usersService.create(signUpDto);

    return await this.generateToken(user);
  }

  async generateToken(user: User) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      access_token: token,
    };
  }
}
