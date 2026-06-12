import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { OwnerService } from './owner.service';
@Injectable()
export class InboundService {
  constructor(@Inject(forwardRef(() => OwnerService)) private readonly ownerService: OwnerService) {}
  private readonly rows = [{ id: 1, orderNo: 'INB-20260612-0001', ownerId: 1, supplier: '华东供应商', eta: '2026-06-12', ata: '2026-06-12', status: 'QCInProgress', qcInspectorId: 2, keeperId: 3, remark: '优先质检', items: [{ id: 1, productId: 1, batchNo: 'B202606', expectedQty: 120, actualQty: 118, qcResult: 'Partial', binLocationId: 1 }] }];
  findAll() { return this.rows; }
  create(payload: any) {
    const owner = this.ownerService.findById(payload.ownerId);
    if (owner && owner.debt > owner.creditLimit) {
      throw new BadRequestException(`货主【${owner.name}】欠款 ${owner.debt} 已超过授信额度 ${owner.creditLimit}，禁止创建入库单`);
    }
    const row = { ...payload, id: this.rows.length + 1 }; this.rows.push(row); return row;
  }
}
