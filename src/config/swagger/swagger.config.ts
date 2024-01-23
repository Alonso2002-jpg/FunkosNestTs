import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

// Para evitar que un endpint salga: @ApiExcludeController() // Excluir el controlador de Swagger

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Funkos Nestjs DAW 2023/2024')
    .setDescription('API de ejemplo del curso Desarrollo.')
    .setContact(
      'Jorge Alonso Cruz Vera',
      'https://joseluisgs.dev',
      'alonsojorge980313810@hotmail.com',
    )
    .setExternalDoc(
      'Documentación de la API',
      'https://github.com/Alonso2002-jpg',
    )
    .setLicense('CC BY-NC-SA 4.0', 'https://github.com/Alonso2002-jpg')
    .setVersion('1.0.0')
    .addTag('Funkos', 'Operaciones con Funkos')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addBearerAuth() // Añadimos el token de autenticación
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document) // http://localhost:3000/api
}
