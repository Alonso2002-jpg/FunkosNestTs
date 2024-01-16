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
} from '@nestjs/common'
import { CategoriaService } from './categoria.service'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('categoria')
@UseInterceptors(CacheInterceptor)
export class CategoriaController {
  private readonly logger: Logger = new Logger(CategoriaController.name)
  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly categoriaMapper: CategoriaMapper,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creando Categoria: ${JSON.stringify(createCategoriaDto)}`)
    return this.categoriaMapper.mapResponse(
      await this.categoriaService.create(createCategoriaDto),
    )
  }

  @Get()
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Obteniendo todas las categorias')
    return await this.categoriaService.findAllPag(query)
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Obteniendo Categoria: ${id}`)
    return this.categoriaMapper.mapResponse(
      await this.categoriaService.findOne(id),
    )
  }

  @Put(':id')
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
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Eliminando Categoria: ${id}`)
    return this.categoriaService.remove(id)
  }
}
