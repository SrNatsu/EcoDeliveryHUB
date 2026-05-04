export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';

export interface DeliveryDto {
  id: number;
  destination: string;
  status: DeliveryStatus;
  distance: number;
}
