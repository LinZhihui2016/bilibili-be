import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ErrBase, ResException } from '../../util/error';
import { $val } from '../../util/mysql';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  findOne(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  async validate(username: string, password: string) {
    const user = await this.findOne(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.findOne(username);
    if (!user) {
      throw new ResException(ErrBase.账号不存在);
    }
    if (user.password !== password) {
      throw new ResException(ErrBase.密码错误);
    }
    return {
      access_token: this.jwtService.sign({ username, password }),
    };
  }

  async register(username: string, password: string) {
    const user = await this.findOne(username);
    if (user) {
      throw new ResException(ErrBase.该账号已存在);
    }
    const data = await $val(new UserEntity(), { username, password });
    const { id } = await this.userRepository.save(data);
    return {
      id,
      username,
      access_token: this.jwtService.sign({ username, password }),
    };
  }
}
