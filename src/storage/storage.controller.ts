import {
  Controller,
  Get,
  Param,
  Logger,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common'
import { StorageService } from './storage.service'
import { v4 as uuidv4 } from 'uuid'
import { extname } from 'path'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { Request, Response } from 'express'
import {
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@Controller('storage')
@ApiTags('Storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name)

  constructor(private readonly storageService: StorageService) {}
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const fileName = uuidv4() // usamos uuid para generar un nombre único para el archivo
          const fileExt = extname(file.originalname) // extraemos la extensión del archivo
          cb(null, `${fileName}${fileExt}`) // llamamos al callback con el nombre del archivo
        },
      }),
      // Validación de archivos
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          // Note: You can customize this error message to be more specific
          cb(new BadRequestException('Fichero no soportado.'), false)
        } else {
          cb(null, true)
        }
      },
    }),
  ) // 'file' es el nombre del campo en el formulario
  storeFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    this.logger.log(`Subiendo archivo:  ${file}`)

    if (!file) {
      throw new BadRequestException('Fichero no encontrado.')
    }

    // Construimos la url del fichero, que será la url de la API + el nombre del fichero
    const apiVersion = process.env.API_VERSION
      ? `/${process.env.API_VERSION}`
      : ''
    const url = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${
      file.filename
    }`
    console.log(file)
    return {
      originalname: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: url,
    }
  }

  @ApiResponse({
    status: 200,
    description:
      'El fichero se ha encontrado y se devuelve el fichero en la respuesta',
    type: String,
  })
  @ApiParam({
    name: 'filename',
    description: 'Nombre del fichero',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'El fichero no existe',
  })
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    this.logger.log(`Buscando fichero ${filename}`)
    const filePath = this.storageService.findFile(filename)
    this.logger.log(`Fichero encontrado ${filePath}`)
    res.sendFile(filePath) // enviamos el archivo
  }

  @Get()
  hole() {
    return 'Hola'
  }
}
