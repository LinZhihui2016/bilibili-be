import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import config from '../../config/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../jwt/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: config.secret,
      signOptions: { expiresIn: '6h' },
    }),
    PassportModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService, JwtModule],
})
export class UserModule {}
