import { Category } from '../entities/funko.entity'

export class ResponseFunkoDto {
  id: number
  name: string
  price: number
  category: Category
  quantity: number
  isDeleted: boolean
}
