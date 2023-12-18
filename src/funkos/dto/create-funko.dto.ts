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
import { Category } from '../entities/funko.entity'
export class CreateFunkoDto {
  @IsNotEmpty({ message: 'El nombre del Funko es requerido' })
  @IsString({
    message: 'El nombre del Funko debe ser una cadena de caracteres',
  })
  name: string
  @IsNumber({}, { message: 'El precio del Funko debe ser un numero' })
  @IsNotEmpty()
  @Min(0)
  @Max(10000.0)
  price: number
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(10000)
  quantity: number
  @IsEnum(Category)
  @IsNotEmpty()
  category: Category
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean
}
