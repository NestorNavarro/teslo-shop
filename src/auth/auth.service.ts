import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { LoginUserDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        token: this.getJwt({ id: user.id }),
        ...user,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['email', 'fullName', 'id', 'isActive', 'password', 'roles'],
      });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Incorrect Credentials');
      }
      delete user.password;
      return {
        token: this.getJwt({ id: user.id }),
        ...user,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    console.log(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if (error.status === 401) {
      throw new UnauthorizedException('Incorrect Credentials');
    }
    console.error(error);
    throw new InternalServerErrorException('Pleas check errors logs');
  }
}
