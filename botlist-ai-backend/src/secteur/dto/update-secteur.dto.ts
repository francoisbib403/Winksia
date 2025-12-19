import { PartialType } from '@nestjs/swagger';
import { CreateSecteurDto } from './create-secteur.dto';

export class UpdateSecteurDto extends PartialType(CreateSecteurDto) {}
