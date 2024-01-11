export class FunkosNotificationDto {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public img: string,
    public category: string,
    public quantity: number,
    public isDeleted: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
