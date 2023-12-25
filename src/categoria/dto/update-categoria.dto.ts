import { PartialType } from '@nestjs/mapped-types'
import { CreateCategoriaDto } from './create-categoria.dto'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  @IsString({
    message: 'El nombre de la categoria debe ser una cadena de caracteres',
  })
  @Transform((name) => name?.value.trim())
  @IsOptional()
  nombreCategoria?: string
  @IsBoolean({ message: 'El estado del Funko debe ser un booleano' })
  @IsOptional()
  isDeleted?: boolean
}
