// Service User pour la gestion des utilisateurs
import bcrypt from 'bcryptjs';
import * as db from './supabase';
import { userToResponse } from '@/types/auth';

// Interface Supabase (snake_case)
interface SupabaseUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  company: string | null;
  job_title: string | null;
  role: string;
  is_active: boolean;
  is_public_profile: boolean;
  preferred_language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  theme: string;
  activation_code: string | null;
  activation_code_expires_at: string | null;
  reset_password_code: string | null;
  reset_password_code_expires_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Convert Supabase data (snake_case) to User interface (camelCase)
function supabaseToUser(data: SupabaseUser): User {
  return {
    id: data.id,
    email: data.email,
    password: data.password,
    firstname: data.first_name || '',
    lastname: data.last_name || '',
    avatarUrl: data.avatar_url || undefined,
    bio: data.bio || undefined,
    website: data.website || undefined,
    company: data.company || undefined,
    jobTitle: data.job_title || undefined,
    role: data.role,
    isActive: data.is_active,
    isPublicProfile: data.is_public_profile,
    preferredLanguage: data.preferred_language,
    emailNotifications: data.email_notifications,
    pushNotifications: data.push_notifications,
    theme: data.theme,
    activationCode: data.activation_code || null,
    activationCodeExpiresAt: data.activation_code_expires_at || null,
    resetPasswordCode: data.reset_password_code || null,
    resetPasswordCodeExpiresAt: data.reset_password_code_expires_at || null,
    lastLoginAt: data.last_login_at || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

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
  const users = await db.findAll<SupabaseUser>('users');
  return users.map(supabaseToUser);
}

export async function findOneByEmail(email: string): Promise<User | null> {
  const user = await db.findOneBy<SupabaseUser>('users', 'email', email);
  return user ? supabaseToUser(user) : null;
}

export async function findOneById(id: string): Promise<User | null> {
  const user = await db.findOne<SupabaseUser>('users', id);
  return user ? supabaseToUser(user) : null;
}

export async function checkEmail(email: string, excludeId?: string): Promise<boolean> {
  if (excludeId) {
    const users = await db.query<SupabaseUser>(
      'users',
      (query: any) => query.select('*').eq('email', email).neq('id', excludeId)
    );
    return users.length > 0;
  }
  const user = await db.findOneBy<SupabaseUser>('users', 'email', email);
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
  
  const user = await db.create<SupabaseUser>('users', userData);
  return supabaseToUser(user);
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
  
  const updatedUser = await db.update<SupabaseUser>('users', id, updateData);
  return supabaseToUser(updatedUser);
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
  const updatedUser = await db.update<SupabaseUser>('users', userId, { password: hashedPassword });
  return supabaseToUser(updatedUser);
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
