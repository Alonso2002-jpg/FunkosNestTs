import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateCategoriaDto {
  @IsNotEmpty({ message: 'El nombre de la categoria es requerido' })
  @IsString({
    message: 'El nombre de la categoria debe ser una cadena de caracteres',
  })
  @Transform((name) => name?.value.trim().toUpperCase())
  @Matches('^(SERIE|DISNEY|SUPERHEROES|PELICULAS|OTROS)$')
  nombreCategoria: string
  @IsBoolean({ message: 'El estado del Funko debe ser un booleano' })
  @IsOptional()
  isDeleted?: boolean
}
