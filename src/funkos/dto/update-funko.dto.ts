import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsString({
    message: 'El nombre del Funko debe ser una cadena de caracteres',
  })
  @Transform((name) => name?.value.trim())
  @IsOptional()
  name?: string
  @IsNumber({}, { message: 'El precio del Funko debe ser un numero' })
  @IsOptional()
  @Min(0, { message: 'El precio del Funko debe ser mayor o igual a 0' })
  @Max(10000.0, {
    message: 'El precio del Funko debe ser menor o igual a 10000.0',
  })
  price?: number
  @IsBoolean({ message: 'El estado del Funko debe ser un booleano' })
  @IsOptional()
  isDeleted?: boolean
  @IsInt({ message: 'La cantidad del Funko debe ser un entero' })
  @IsOptional()
  @Min(0, { message: 'La cantidad del Funko debe ser mayor o igual a 0' })
  @Max(10000, {
    message: 'La cantidad del Funko debe ser menor o igual a 10000',
  })
  quantity?: number
  @IsOptional()
  category?: string
}
