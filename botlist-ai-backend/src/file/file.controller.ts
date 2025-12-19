import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Roles } from 'src/auth/role/roles.decorator';
import { RoleGuard } from 'src/auth/role/role.guard';
import { USER_ROLE } from 'src/user/enum';
import { Public } from 'src/auth/jwt-auth.guard';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RoleGuard)
  findAll() {
    return this.fileService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.fileService.remove(id);
    return { message: 'File deleted' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.save(file);
  }

  @Public()
  @Get('download/:key')
  async download(@Param('key') key: string, @Res() res: Response) {
    try {
      const fileData = await this.fileService.download(key);
      
      if (fileData instanceof Buffer) {
        // For Supabase, fileData is a Buffer
        res.setHeader('Content-disposition', `attachment; filename=${key}`);
        res.setHeader('Content-type', 'application/octet-stream');
        res.send(fileData);
      } else {
        // For streams (if we implement streaming later)
        res.setHeader('Content-disposition', `attachment; filename=${key}`);
        res.setHeader('Content-type', 'application/octet-stream');
        // fileData.pipe(res); // This would be for streaming
        res.send(fileData); // For now, send as buffer
      }
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'File not found' });
    }
  }
}
