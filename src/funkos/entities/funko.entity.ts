export class Funko {
  id: number
  name: string
  price?: number
  quantity: number
  category: Category
  createdAt: Date = new Date()
  updatedAt: Date = new Date()
  isDeleted: boolean = false
}

export enum Category {
  POP = 'POP',
  DISNEY = 'DISNEY',
  STAR_WARS = 'STAR_WARS',
  MARVEL = 'MARVEL',
}
