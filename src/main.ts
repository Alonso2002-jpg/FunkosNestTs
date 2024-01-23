import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'process'
import { ValidationPipe } from '@nestjs/common'
import { readFileSync } from 'fs'
import * as path from 'path'
import { setupSwagger } from './config/swagger/swagger.config'

async function bootstrap() {
  // Leemos la configuración de los certificados SSL
  const httpsOptions = {
    key: readFileSync(path.resolve(process.env.SSL_KEY)),
    cert: readFileSync(path.resolve(process.env.SSL_CERT)),
  }
  const app = await NestFactory.create(AppModule, { httpsOptions })
  // Configuración de la versión de la API
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
  // Activamos las validaciones body y dtos
  app.useGlobalPipes(new ValidationPipe())
  // Configuración del puerto de escucha
  await app.listen(process.env.API_PORT || 3000)
}
bootstrap().then(() =>
  console.log(
    `🟢 Servidor escuchando en puerto: ${
      process.env.API_PORT || 3000
    } y perfil: ${process.env.NODE_ENV} 🚀`,
  ),
)
