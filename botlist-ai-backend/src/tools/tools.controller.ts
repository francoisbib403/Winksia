import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { Observable } from 'rxjs';
import { ToolsRealtimeService } from './tools.realtime.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Roles } from 'src/auth/role/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/role/role.guard';
import { USER_ROLE } from 'src/user/enum';
import { Public } from 'src/auth/jwt-auth.guard';        // ← importer ici
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService, private readonly toolsRealtime: ToolsRealtimeService) {}
  @Public()   
  @Post()
  //@Roles(USER_ROLE.ADMIN)
 // @UseGuards(AuthGuard(), RoleGuard)
  create(@Body() createToolDto: CreateToolDto) {
    return this.toolsService.create(createToolDto);
  }
  @Public()   
  @Patch(':id')
  //@Roles(USER_ROLE.ADMIN)
 // @UseGuards(AuthGuard(), RoleGuard)
  update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolsService.update(id, updateToolDto);
  }
  @Public()   
  @Delete(':id')
  //@Roles(USER_ROLE.ADMIN)
  //@UseGuards(AuthGuard(), RoleGuard)
  remove(@Param('id') id: string) {
    return this.toolsService.remove(id);
  }

  
  @Public()          // ← rend cette route accessible sans jeton
  @Get()
  findAll() {
    return this.toolsService.findAll();
  }
  @Public()          // ← rend cette route accessible sans jeton
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolsService.findOne(id);
  }

  @Public()
  @Sse('realtime')
  realtime(
    @Query('categories') categories?: string,
    @Query('tags') tags?: string,
    @Query('pricing_model') pricing_model?: string,
    // Nouveaux alias attendus côté front
    @Query('secteurs') secteurs?: string,
    @Query('use_cases') use_cases?: string,
    @Query('pricing') pricing?: string,
    @Query('api_available') api_available?: string,
    @Query('open_source') open_source?: string,
  ): Observable<MessageEvent> {
    // Normalisation des nouveaux alias vers le modèle existant
    const normCategories = (categories || secteurs || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const normTags = (tags || use_cases || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Mapping pricing (labels UI -> enum API)
    const mapPricing = (p?: string): string | undefined => {
      if (!p) return undefined;
      const v = p.toLowerCase();
      if (v.includes('gratuit')) return 'free';
      if (v.includes('freemium')) return 'freemium';
      if (v.includes('payant') || v.includes('abo') || v.includes('abonnement')) return 'paid';
      if (v.includes('enterprise') || v.includes('entreprise')) return 'enterprise';
      if (v.includes('api')) return 'api_based';
      return p; // déjà au bon format
    };

    const normalizedPricingModel = mapPricing(pricing) || pricing_model || undefined;

    const filters = {
      categories: normCategories,
      tags: normTags,
      pricing_model: normalizedPricingModel,
      api_available: api_available === 'true' ? true : api_available === 'false' ? false : undefined,
      open_source: open_source === 'true' ? true : open_source === 'false' ? false : undefined,
    };
    return this.toolsRealtime.realtimeStream(filters);
  }

}
