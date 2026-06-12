<template>
  <PageShell title="入库管理">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <StepIndicator :steps="['收货','质检','上架','完成']" :active="2" />
      <el-button type="primary" @click="handleOpenCreate">新增入库单</el-button>
    </div>
    <el-card>
      <el-table :data="rows" empty-text="暂无入库单，请确认后端服务或新增收货任务">
        <el-table-column prop="orderNo" label="单号" />
        <el-table-column prop="supplier" label="供应商" />
        <el-table-column label="状态"><template #default="{ row }"><StatusBadge :status="row.status" /></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="创建入库单" width="480px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="货主">
          <el-select v-model="form.ownerId" placeholder="请选择货主" style="width:100%">
            <el-option v-for="o in owners" :key="o.id" :label="o.name" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商"><el-input v-model="form.supplier" placeholder="请输入供应商" /></el-form-item>
        <el-form-item label="预计到货"><el-date-picker v-model="form.eta" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认创建</el-button>
      </template>
    </el-dialog>
  </PageShell>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageShell from './PageShell.vue';
import { inboundApi } from '../api/inbound';
import { ownerApi } from '../api/owner';
import StatusBadge from '../components/common/StatusBadge.vue';
import StepIndicator from '../components/common/StepIndicator.vue';
import { InboundStatus } from '../types/enums';
import type { InboundOrder, Owner } from '../types';

const rows = ref<InboundOrder[]>([]);
const owners = ref<Owner[]>([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const form = reactive<{ ownerId: number | null; supplier: string; eta: string; remark: string }>({
  ownerId: null,
  supplier: '',
  eta: '',
  remark: ''
});

const loadOwners = async () => { owners.value = await ownerApi.list<Owner>().catch(() => []); };
const loadRows = async () => { rows.value = await inboundApi.list<InboundOrder>().catch(() => []); };

onMounted(async () => {
  await Promise.all([loadRows(), loadOwners()]);
});

const handleOpenCreate = () => {
  form.ownerId = null;
  form.supplier = '';
  form.eta = '';
  form.remark = '';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!form.ownerId) { ElMessage.warning('请选择货主'); return; }
  if (!form.supplier.trim()) { ElMessage.warning('请输入供应商'); return; }
  if (!form.eta) { ElMessage.warning('请选择预计到货日期'); return; }
  submitting.value = true;
  try {
    const payload = {
      orderNo: `INB-${Date.now()}`,
      ownerId: form.ownerId,
      supplier: form.supplier.trim(),
      eta: form.eta,
      status: InboundStatus.Pending,
      qcInspectorId: 0,
      keeperId: 0,
      remark: form.remark,
      items: []
    };
    await inboundApi.create<InboundOrder>(payload);
    ElMessage.success('入库单创建成功');
    dialogVisible.value = false;
    await loadRows();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    try {
      const parsed = JSON.parse(msg);
      ElMessage.error(parsed.message || msg);
    } catch {
      ElMessage.error(msg || '创建失败');
    }
  } finally {
    submitting.value = false;
  }
};
</script>
