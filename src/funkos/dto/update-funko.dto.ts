import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Category } from '../entities/funko.entity'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsString()
  @IsOptional()
  name?: string
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10000)
  quantity: number
  @IsEnum(Category)
  @IsOptional()
  category?: Category
}
