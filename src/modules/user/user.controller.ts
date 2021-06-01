import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../jwt/jwt.guard';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('api3/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //
  // @Post('login')
  // login(@Body() body) {
  //   const { username, password } = body;
  //   return this.authService.login({ username, password });
  // }
  //
  @UseGuards(JwtGuard)
  @Get('')
  check(@Req() req) {
    return req.user;
  }

  @Post('login')
  async login(@Body() body: UserDto) {
    const { username, password } = body;
    return this.userService.login(username, password);
  }

  @Post('register')
  async register(@Body() body: UserDto) {
    const { username, password } = body;
    return this.userService.register(username, password);
  }
}
