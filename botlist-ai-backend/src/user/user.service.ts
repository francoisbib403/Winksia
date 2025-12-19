import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseHelper } from '../supabase/supabase-helper';
import { User } from './entities/user.entity';
import slugify from 'slugify';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from 'src/mail/mail.service';
import { USER_STATUS } from './enum';
import otpGenerator from 'otp-generator';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseHelper: SupabaseHelper,
    private readonly mailService: MailService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.supabaseHelper.findAll('users');
    return users as User[];
  }

  async findOneByEmail(email: string) {
    return await this.supabaseHelper.findOneBy('users', 'email', email);
  }

  async findOneByEmailAndFailed(email: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user as User;
  }

  async checkEmail(email: string, id?: string): Promise<boolean> {
    let user;
    if (id) {
      user = await this.supabaseHelper.query(
        'users',
        (query: any) => query.select('*').eq('email', email).neq('id', id)
      );
    } else {
      user = await this.supabaseHelper.findOneBy('users', 'email', email);
    }

    return !!user;
  }

  async findOneById(id: string) {
    return await this.supabaseHelper.findOne('users', id);
  }

  async findOneByIdAndFailed(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    return user as User;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.checkEmail(dto.email);
    if (existing) throw new ConflictException('Email already used');

    const user = new User();

    Object.assign(user, {
      ...dto,
      activate: false,
      status: USER_STATUS.BLOCKED,
    });

    user.slug = await this.searchSlug(user);

    // Hash password before saving
    await user.hashPassword();

    const createdUser = await this.supabaseHelper.create('users', user);
    return createdUser as User;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneByIdAndFailed(id);
    Object.assign(user, dto);
    
    const updatedUser = await this.supabaseHelper.update('users', id, user);
    return updatedUser as User;
  }

  async changePassword(user: User, currentPwd: string, newPwd: string) {
    const isMatch = await bcrypt.compare(currentPwd, user.pwd);
    if (!isMatch) throw new ConflictException('Invalid credentials');

    user.pwd = newPwd;
    await user.hashPassword();
    
    const updatedUser = await this.supabaseHelper.update('users', user.id, user);
    return updatedUser as User;
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.findOneByEmailAndFailed(email);
    const newPwd = this.generatePassword();

    user.pwd = newPwd;
    await user.hashPassword();

    await this.mailService.sendDefault(
      email,
      `Réinitialisation mot de passe ${process.env.APP_NAME}`,
      'reset-password',
      {
        pwd: user.pwd,
        url: process.env.FRONT_HOST,
      },
    );

    await this.supabaseHelper.update('users', user.id, user);
  }

  async remove(id: string): Promise<void> {
    await this.supabaseHelper.remove('users', id);
  }

  async save(user: User): Promise<User> {
    if (user.id) {
      const updatedUser = await this.supabaseHelper.update('users', user.id, user);
      return updatedUser as User;
    } else {
      const createdUser = await this.supabaseHelper.create('users', user);
      return createdUser as User;
    }
  }

  async searchSlug(user: User): Promise<string> {
    const baseSlug = slugify(`${user.firstname} ${user.lastname}`, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let count = 1;

    while (await this.supabaseHelper.findOneBy('users', 'slug', slug)) {
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  }

  private generatePassword(): string {
    return otpGenerator.generate(8, {
      upperCaseAlphabets: true,
      specialChars: true,
      lowerCaseAlphabets: true,
      digits: true,
    });
  }
}
