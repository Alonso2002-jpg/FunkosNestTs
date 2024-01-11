import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { join } from 'path'
import * as process from 'process'

@Injectable()
export class StorageService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './storage-dir'
  private readonly isDev = process.env.NODE_ENV === 'dev'
  private readonly logger = new Logger(StorageService.name)

  constructor() {
    this.onModuleInit()
  }
  async onModuleInit() {
    if (this.isDev) {
      if (fs.existsSync(this.uploadDir)) {
        this.logger.log(`Eliminando ficheros de ${this.uploadDir}`)
        fs.readdirSync(this.uploadDir).forEach((file) => {
          fs.unlinkSync(path.join(this.uploadDir, file))
        })
      } else {
        this.logger.log(
          `Creando directorio de subida de archivos en ${this.uploadDir}`,
        )
        fs.mkdirSync(this.uploadDir)
      }
    }
  }

  findFile(filename: string): string {
    this.logger.log(`Buscando fichero ${filename}`)
    const file = join(
      process.cwd(), // process.cwd() devuelve el directorio de trabajo actual
      process.env.UPLOAD_DIR || './storage-dir', // directorio de subida de archivos
      filename, // nombre del archivo
    )
    if (fs.existsSync(file)) {
      this.logger.log(`Fichero encontrado ${file}`)
      return file
    } else {
      throw new NotFoundException(`El fichero ${filename} no existe.`)
    }
  }

  getFileNameWithoutUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl)
      const pathname = url.pathname // '/v1/storage/bd9e0f33-21b4-4abd-9659-069b6fcf7fb4.png'
      const segments = pathname.split('/')
      return segments[segments.length - 1]
    } catch (error) {
      this.logger.error(error)
      return fileUrl
    }
  }

  removeFile(filename: string): void {
    this.logger.log(`Eliminando fichero ${filename}`)
    const file = join(
      process.cwd(), // process.cwd() devuelve el directorio de trabajo actual
      process.env.UPLOADS_DIR || './storage-dir', // directorio de subida de archivos
      filename, // nombre del archivo
    )
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    } else {
      throw new NotFoundException(`El fichero ${filename} no existe.`)
    }
  }

  generateUrl(filename: string): string {
    this.logger.log(`Generating url for ${filename}`)
    const apiVersion = process.env.API_VERSION
      ? `/${process.env.API_VERSION}`
      : ''
    const actUrl = process.env.ACT_URL
      ? `${process.env.ACT_URL}:${process.env.API_PORT}`
      : 'http://localhost'
    return `${actUrl}${apiVersion}/storage/${filename}`
  }
}
