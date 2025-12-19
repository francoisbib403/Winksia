import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule as ConfigEnv } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { FileModule } from './file/file.module';
import { ToolsModule } from './tools/tools.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { AssistantModule } from './assistant/assistant.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SecteurModule } from './secteur/secteur.module';
import { MetierModule } from './metier/metier.module';
import { TacheModule } from './tache/tache.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigEnv.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DATABASE_HOST,
    //   port: parseInt(process.env.DATABASE_PORT || '5432'),
    //   username: process.env.DATABASE_USER,
    //   password: process.env.DATABASE_PASSWORD,
    //   database: process.env.DATABASE_NAME,
    //   ssl: false,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    SupabaseModule,
    MailModule,
    AuthModule,
    UserModule,
    FileModule,
    ToolsModule,
    CategoriesModule,
    AssistantModule,
    TagsModule,
    ReviewsModule,
    SecteurModule,
    MetierModule,
    TacheModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
