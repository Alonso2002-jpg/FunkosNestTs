import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Logger,
  HttpCode,
  Put,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common'
import { CategoriaService } from './categoria.service'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'

@Controller('categoria')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class CategoriaController {
  private readonly logger: Logger = new Logger(CategoriaController.name)
  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly categoriaMapper: CategoriaMapper,
  ) {}

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creando Categoria: ${JSON.stringify(createCategoriaDto)}`)
    return this.categoriaMapper.mapResponse(
      await this.categoriaService.create(createCategoriaDto),
    )
  }

  @Get()
  @Roles('USER')
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Obteniendo todas las categorias')
    return await this.categoriaService.findAllPag(query)
  }

  @Get(':id')
  @Roles('USER')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Obteniendo Categoria: ${id}`)
    return this.categoriaMapper.mapResponse(
      await this.categoriaService.findOne(id),
    )
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    this.logger.log(`Actualizando Categoria: ${id}`)
    return this.categoriaMapper.mapResponse(
      await this.categoriaService.update(id, updateCategoriaDto),
    )
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Eliminando Categoria: ${id}`)
    return this.categoriaService.remove(id)
  }
}
