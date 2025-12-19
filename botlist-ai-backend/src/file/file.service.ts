import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { File } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async save(upload: Express.Multer.File): Promise<File> {
    const fileName = `${new Date().getTime()}_${upload.originalname}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .upload(fileName, upload.buffer, {
        contentType: upload.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = this.supabaseService.getAdminClient().storage
      .from('uploads')
      .getPublicUrl(fileName);

    // Save file metadata to database (you might want to create a separate table for this)
    const file = new File();
    file.id = data.path; // Use the path as ID
    file.name = fileName;
    file.path = publicUrl;
    file.extension = upload.mimetype;
    
    return file;
  }

  async findAll(): Promise<File[]> {
    // List all files in the uploads bucket
    const { data, error } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    // Convert to File objects
    return data.map(item => {
      const { data: { publicUrl } } = this.supabaseService.getAdminClient().storage
        .from('uploads')
        .getPublicUrl(item.name);
      
      const file = new File();
      file.id = item.id;
      file.name = item.name;
      file.path = publicUrl;
      file.extension = item.metadata?.mimetype || 'application/octet-stream';
      return file;
    });
  }

  async findOne(id: string): Promise<File> {
    // Get file info from Supabase
    const { data } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .getPublicUrl(id);

    const file = new File();
    file.id = id;
    file.name = id;
    file.path = data.publicUrl;
    
    return file;
  }

  async remove(id: string) {
    // Delete file from Supabase Storage
    const { error } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .remove([id]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return { deleted: true };
  }

  async upload(file: Express.Multer.File) {
    const fileName = `${new Date().getTime()}_${file.originalname}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = this.supabaseService.getAdminClient().storage
      .from('uploads')
      .getPublicUrl(fileName);

    return {
      key: fileName,
      url: publicUrl,
    };
  }

  async download(fileKey: string) {
    // Download file from Supabase Storage
    const { data, error } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .download(fileKey);

    if (error) {
      throw new Error(`File not found: ${error.message}`);
    }

    return data;
  }

  async delete(fileKey: string) {
    // Delete file from Supabase Storage
    const { error } = await this.supabaseService.getAdminClient().storage
      .from('uploads')
      .remove([fileKey]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return { deleted: true };
  }
}
