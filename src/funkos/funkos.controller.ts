import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkoExistsGuard } from './guards/funko-exists.guard'
import { FunkosMapper } from './mapper/funkos.mapper'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, parse } from 'path'
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name)
  constructor(
    private readonly funkosService: FunkosService,
    private readonly funkosMapper: FunkosMapper,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creando Funko: ${JSON.stringify(createFunkoDto)}`)
    return this.funkosMapper.mapResponse(
      await this.funkosService.create(createFunkoDto),
    )
  }

  @Get()
  @CacheTTL(3)
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Consultando todos los Funkos')
    return await this.funkosService.findAllPag(query)
  }

  @UseGuards(FunkoExistsGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Consultando Funko: ${id}`)
    return this.funkosMapper.mapResponse(await this.funkosService.findOne(+id))
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    this.logger.log(`Actualizando Funko: ${id}`)
    return this.funkosMapper.mapResponse(
      await this.funkosService.update(+id, updateFunkoDto),
    )
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Eliminando Funko: ${id}`)
    return await this.funkosService.remove(+id)
  }

  @UseGuards(FunkoExistsGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './storage-dir',
        filename: (req, file, cb) => {
          // const fileName = uuidv4() // usamos uuid para generar un nombre único para el archivo
          const { name } = parse(file.originalname)
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname) // extraemos la extensión del archivo
          cb(null, `${fileName}${fileExt}`) // llamamos al callback con el nombre del archivo
        },
      }),
      // Validación de archivos
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024 // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          // Note: You can customize this error message to be more specific
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  @Patch('/imagen/:id')
  async updateImg(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`Actualizando Imagen de Funko: ${id}`)
    return this.funkosMapper.mapResponse(
      await this.funkosService.updateImg(id, file, false),
    )
  }
}
