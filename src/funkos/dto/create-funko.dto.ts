import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Transform } from 'class-transformer'
export class CreateFunkoDto {
  @IsNotEmpty({ message: 'El nombre del Funko es requerido' })
  @IsString({
    message: 'El nombre del Funko debe ser una cadena de caracteres',
  })
  @Transform((name) => name?.value.trim())
  name: string
  @IsNumber({}, { message: 'El precio del Funko debe ser un numero' })
  @IsNotEmpty()
  @Min(0, { message: 'El precio del Funko debe ser mayor o igual a 0' })
  @Max(10000.0, {
    message: 'El precio del Funko debe ser menor o igual a 10000.0',
  })
  price: number
  @IsInt({ message: 'La cantidad del Funko debe ser un entero' })
  @IsNotEmpty({ message: 'La cantidad del Funko es requerida' })
  @Min(0, { message: 'La cantidad del Funko debe ser mayor o igual a 0' })
  @Max(10000, {
    message: 'La cantidad del Funko debe ser menor o igual a 10000',
  })
  quantity: number
  @Transform((category) => category?.value.trim().toUpperCase())
  @IsNotEmpty({ message: 'La categoria del Funko es requerida' })
  category: string
  @IsBoolean({ message: 'El estado del Funko debe ser un booleano' })
  @IsOptional()
  isDeleted?: boolean
}
