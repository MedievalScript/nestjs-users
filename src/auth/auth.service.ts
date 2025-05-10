import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import { UsersService } from '../user/user.service';
import { UserType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async login(user: LoginDto) {
    const foundUser = await this.prisma.user.findUnique({
      where: { email: user.email },
      include: {
        memberships: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found.');
    }

    if (
      foundUser.type !== UserType.ADMIN &&
      foundUser.memberships.length === 0
    ) {
      throw new ConflictException('User has no membership');
    }

    if (foundUser.password === user.password) {
      console.log('foundYSer');
      return this.jwtService.sign({
        id: foundUser.id,
        email: foundUser.email,
        type: foundUser.type,
        memberships: foundUser.memberships.map((m) => m.organizationId),
      });
    }

    throw new NotFoundException('Wrong credentials');
  }

  async register(user: RegisterUserDto) {
    const { email, confirmEmail, password } = user;

    if (email !== confirmEmail) {
      throw new BadRequestException('Email does not match');
    }

    const defaultOrganization = await this.prisma.organization.findUnique({
      where: { id: process.env.DEFAULT_ORGANIZATION_ID },
    });

    if (!defaultOrganization) {
      throw new NotFoundException(`Default organization not found`);
    }

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (foundUser) {
      throw new ConflictException(`Email ${email} already exist`);
    }

    const { id: userId } = await this.prisma.user.create({
      data: {
        email,
        password,
        memberships: {
          create: {
            organization: {
              connect: { id: defaultOrganization.id },
            },
          },
        },
      },
    });

    return `User ${userId} created`;
  }
}
