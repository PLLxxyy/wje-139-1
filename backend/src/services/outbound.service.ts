import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { OwnerService } from './owner.service';
@Injectable()
export class OutboundService {
  constructor(@Inject(forwardRef(() => OwnerService)) private readonly ownerService: OwnerService) {}
  private readonly rows = [{ id: 1, orderNo: 'OUT-20260612-0001', ownerId: 1, receiver: '杭州门店', address: '杭州萧山', requiredShipDate: '2026-06-13', status: 'Picking', pickerId: 4, checkerId: 5, trackingNo: '', items: [{ id: 1, productId: 1, binLocationId: 1, expectedQty: 30, actualQty: 28 }] }];
  findAll() { return this.rows; }
  create(payload: any) {
    const owner = this.ownerService.findById(payload.ownerId);
    if (owner && owner.debt > owner.creditLimit) {
      throw new BadRequestException({
        code: 'OWNER_CREDIT_EXCEEDED',
        message: '货主欠款超过授信额度',
        data: { name: owner.name, debt: owner.debt, creditLimit: owner.creditLimit }
      });
    }
    const row = { ...payload, id: this.rows.length + 1 }; this.rows.push(row); return row;
  }
}
