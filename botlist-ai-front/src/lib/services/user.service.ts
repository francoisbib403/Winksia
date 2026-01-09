// Service User pour la gestion des utilisateurs
import bcrypt from 'bcryptjs';
import * as db from './supabase';
import { userToResponse } from '@/types/auth';

export interface User {
  id: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  role: string;
  isActive: boolean;
  isPublicProfile: boolean;
  preferredLanguage: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: string;
  activationCode?: string | null;
  activationCodeExpiresAt?: string | null;
  resetPasswordCode?: string | null;
  resetPasswordCodeExpiresAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export interface UpdateUserDto {
  firstname?: string;
  lastname?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  isPublicProfile?: boolean;
  preferredLanguage?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: string;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function findAll(): Promise<User[]> {
  const users = await db.findAll<User>('users');
  return users;
}

export async function findOneByEmail(email: string): Promise<User | null> {
  return db.findOneBy<User>('users', 'email', email);
}

export async function findOneById(id: string): Promise<User | null> {
  return db.findOne<User>('users', id);
}

export async function checkEmail(email: string, excludeId?: string): Promise<boolean> {
  if (excludeId) {
    const users = await db.query<User>(
      'users',
      (query: any) => query.select('*').eq('email', email).neq('id', excludeId)
    );
    return users.length > 0;
  }
  const user = await db.findOneBy<User>('users', 'email', email);
  return !!user;
}

export async function create(dto: CreateUserDto): Promise<User> {
  const existing = await checkEmail(dto.email);
  if (existing) {
    throw new Error('Email already used');
  }
  
  const hashedPassword = await hashPassword(dto.password);
  
  const userData = {
    email: dto.email,
    password: hashedPassword,
    first_name: dto.firstname || '',
    last_name: dto.lastname || '',
    role: 'user',
    is_active: true,
    is_public_profile: true,
    preferred_language: 'fr',
    email_notifications: true,
    push_notifications: false,
    theme: 'light',
  };
  
  return db.create<User>('users', userData);
}

export async function update(id: string, dto: UpdateUserDto): Promise<User> {
  const user = await findOneById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  const updateData: any = {};
  
  if (dto.firstname !== undefined) updateData.first_name = dto.firstname;
  if (dto.lastname !== undefined) updateData.last_name = dto.lastname;
  if (dto.avatarUrl !== undefined) updateData.avatar_url = dto.avatarUrl;
  if (dto.bio !== undefined) updateData.bio = dto.bio;
  if (dto.website !== undefined) updateData.website = dto.website;
  if (dto.company !== undefined) updateData.company = dto.company;
  if (dto.jobTitle !== undefined) updateData.job_title = dto.jobTitle;
  if (dto.isPublicProfile !== undefined) updateData.is_public_profile = dto.isPublicProfile;
  if (dto.preferredLanguage !== undefined) updateData.preferred_language = dto.preferredLanguage;
  if (dto.emailNotifications !== undefined) updateData.email_notifications = dto.emailNotifications;
  if (dto.pushNotifications !== undefined) updateData.push_notifications = dto.pushNotifications;
  if (dto.theme !== undefined) updateData.theme = dto.theme;
  
  return db.update<User>('users', id, updateData);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
  const user = await findOneById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  const hashedPassword = await hashPassword(newPassword);
  return db.update<User>('users', userId, { password: hashedPassword });
}

export async function updateLastLogin(userId: string): Promise<void> {
  await db.update<User>('users', userId, { 
    last_login_at: new Date().toISOString() 
  });
}

export async function remove(id: string): Promise<void> {
  await db.remove('users', id);
}

// Helpers pour la conversion
export function toUserResponse(user: User) {
  return userToResponse(user);
}
