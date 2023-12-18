import { Module } from '@nestjs/common'
import { FunkosModule } from './funkos/funkos.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot(), FunkosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
