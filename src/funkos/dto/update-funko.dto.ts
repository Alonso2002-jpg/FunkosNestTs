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
import { ApiProperty } from '@nestjs/swagger'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @ApiProperty({
    example: 'Funko El Genio',
    description: 'El nombre del Funko',
  })
  @IsString({
    message: 'El nombre del Funko debe ser una cadena de caracteres',
  })
  @Transform((name) => name?.value.trim())
  @IsOptional()
  name?: string

  @ApiProperty({
    example: 15.11,
    description: 'El precio del Funko',
  })
  @IsNumber({}, { message: 'El precio del Funko debe ser un numero' })
  @IsOptional()
  @Min(0, { message: 'El precio del Funko debe ser mayor o igual a 0' })
  @Max(10000.0, {
    message: 'El precio del Funko debe ser menor o igual a 10000.0',
  })
  price?: number

  @ApiProperty({ example: true, description: 'El estado del Funko' })
  @IsBoolean({ message: 'El estado del Funko debe ser un booleano' })
  @IsOptional()
  isDeleted?: boolean

  @ApiProperty({
    example: 10,
    description: 'La cantidad del Funko',
    minimum: 0,
    maximum: 10000,
  })
  @IsInt({ message: 'La cantidad del Funko debe ser un entero' })
  @IsOptional()
  @Min(0, { message: 'La cantidad del Funko debe ser mayor o igual a 0' })
  @Max(10000, {
    message: 'La cantidad del Funko debe ser menor o igual a 10000',
  })
  quantity?: number

  @ApiProperty({
    example: 'DISNEY',
    description: 'La categoria del Funko',
  })
  @IsOptional()
  category?: string
}
