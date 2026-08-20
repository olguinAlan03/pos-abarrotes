import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { username: dto.username },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.user_key, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { user_key: user.user_key, username: user.username, role: user.role },
    };
  }

  async getMe(userKey: string) {
    const user = await this.usersRepo.findOne({ where: { user_key: userKey } });
    if (!user) throw new UnauthorizedException();
    return { user_key: user.user_key, username: user.username, role: user.role };
  }

  async createUser(username: string, password: string, role: UserRole) {
    const hashed = await bcrypt.hash(password, 12);
    const user = this.usersRepo.create({ username, password: hashed, role });
    return this.usersRepo.save(user);
  }
}
