export class OrderEntity {
  id: number;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  productId: number;
  product?: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
  serviceId: number;
  service?: {
    id: number;
    name: string;
    location?: {
      id: number;
      city: string;
      state: string;
    };
  };
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
