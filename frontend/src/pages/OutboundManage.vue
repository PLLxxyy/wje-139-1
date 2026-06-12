<template>
  <PageShell title="出库管理">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <StepIndicator :steps="['拣货','复核','打包','发货']" :active="1" />
      <el-button type="primary" @click="handleOpenCreate">新增出库单</el-button>
    </div>
    <el-card><el-table :data="rows"><el-table-column prop="orderNo" label="单号" /><el-table-column prop="receiver" label="收货方" /><el-table-column label="状态"><template #default="{ row }"><StatusBadge :status="row.status" /></template></el-table-column></el-table></el-card>
    <el-dialog v-model="dialogVisible" title="创建出库单" width="480px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="货主">
          <el-select v-model="form.ownerId" placeholder="请选择货主" style="width:100%">
            <el-option v-for="o in owners" :key="o.id" :label="o.name" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="收货方"><el-input v-model="form.receiver" placeholder="请输入收货方" /></el-form-item>
        <el-form-item label="收货地址"><el-input v-model="form.address" placeholder="请输入收货地址" /></el-form-item>
        <el-form-item label="要求发货"><el-date-picker v-model="form.requiredShipDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" /></el-form-item>
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
import { outboundApi } from '../api/outbound';
import { ownerApi } from '../api/owner';
import StatusBadge from '../components/common/StatusBadge.vue';
import StepIndicator from '../components/common/StepIndicator.vue';
import { useApiError } from '../hooks/useApiError';
import { OutboundStatus } from '../types/enums';
import type { OutboundOrder, Owner } from '../types';

const rows = ref<OutboundOrder[]>([]);
const owners = ref<Owner[]>([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const { showError } = useApiError();
const form = reactive<{ ownerId: number | null; receiver: string; address: string; requiredShipDate: string }>({
  ownerId: null,
  receiver: '',
  address: '',
  requiredShipDate: ''
});

const loadOwners = async () => { owners.value = await ownerApi.list<Owner>().catch(() => []); };
const loadRows = async () => { rows.value = await outboundApi.list<OutboundOrder>().catch(() => []); };

onMounted(async () => {
  await Promise.all([loadRows(), loadOwners()]);
});

const handleOpenCreate = () => {
  form.ownerId = null;
  form.receiver = '';
  form.address = '';
  form.requiredShipDate = '';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!form.ownerId) { ElMessage.warning('请选择货主'); return; }
  if (!form.receiver.trim()) { ElMessage.warning('请输入收货方'); return; }
  if (!form.address.trim()) { ElMessage.warning('请输入收货地址'); return; }
  if (!form.requiredShipDate) { ElMessage.warning('请选择要求发货日期'); return; }
  submitting.value = true;
  try {
    const payload = {
      orderNo: `OUT-${Date.now()}`,
      ownerId: form.ownerId,
      receiver: form.receiver.trim(),
      address: form.address.trim(),
      requiredShipDate: form.requiredShipDate,
      status: OutboundStatus.Pending,
      pickerId: 0,
      checkerId: 0,
      trackingNo: '',
      items: []
    };
    await outboundApi.create<OutboundOrder>(payload);
    ElMessage.success('出库单创建成功');
    dialogVisible.value = false;
    await loadRows();
  } catch (e: unknown) {
    showError(e, '出库单创建失败');
  } finally {
    submitting.value = false;
  }
};
</script>
