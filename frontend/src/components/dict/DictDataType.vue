<template>
    <!-- 对话框组件 -->
    <el-dialog v-model="store.visible" :model="formData" title="新增数据">
        <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
            <el-form-item label="字典类型" prop="dict_type">
                <el-input v-model="store.queryParamsDict.type" :disabled="true" />
            </el-form-item>
            <el-form-item label="数据标签" prop="label">
                <el-input v-model="formData.label" placeholder="请输入数据标签" />
            </el-form-item>
            <el-form-item label="数据键值" prop="value">
                <el-input v-model="formData.value" placeholder="请输入数据键值" />
            </el-form-item>
            <el-form-item label="显示排序" prop="sort">
                <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="父节点" prop="param_id">
                <el-select v-model="formData.param_id" clearable>
                    <el-option :label="item.label" :key="item.label" :value="item.label" v-for="item in store.parentList" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="formData.status">
                    <el-radio label="开启" />
                    <el-radio label="关闭" />
                </el-radio-group>
            </el-form-item>
            <el-form-item label="颜色类型" prop="colorType">
                <el-select v-model="formData.color_type">
                    <el-option v-for="item in colorTypeOptions" :key="item.value"
                        :label="item.label + '(' + item.value + ')'" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="CSS Class" prop="cssClass">
                <el-input v-model="formData.css_class" placeholder="请输入 CSS Class" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" placeholder="请输入内容" type="textarea" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="store.visible = false">取 消</el-button>
        </template>
    </el-dialog>
</template>
<script setup>
import { computed, reactive, ref, readonly, onMounted } from 'vue';
import { useStore } from '../../store/index';
import axios from 'axios';// 引入axios库
const store = useStore()//调用useStore函数来创建一个Store实例，并将其赋值给名为store的常量
import { post } from "../../api/api.js"
import { ElMessage } from 'element-plus'
// 数据标签回显样式
const colorTypeOptions = readonly([
    {
        value: 'default',
        label: '默认'
    },
    {
        value: 'primary',
        label: '主要'
    },
    {
        value: 'success',
        label: '成功'
    },
    {
        value: 'info',
        label: '信息'
    },
    {
        value: 'warning',
        label: '警告'
    },
    {
        value: 'danger',
        label: '危险'
    }
])
const formData = reactive({
    id: undefined,
    sort: undefined,
    label: '',
    value: undefined,
    dict_type: store.queryParamsDict.type,
    status: '开启',
    color_type: '',
    css_class: '',
    remark: '',
    param_id: ''
})

const formRules = reactive({
    label: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
    value: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
    sort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref


/** 重置表单 */
const resetForm = () => {
  formRef.value?.resetFields()
}

/** 打开弹窗 */
const openDict = async (type, id) => {
    console.log(type)
    resetForm()//每次打开都重置表单
    console.log(formData)
  // 修改时，设置数据
  if (id!=null) {
    //执行修改操作
  }
}
defineExpose({ openDict }) // 提供 open 方法，用于打开弹窗



const submitForm = async () => {
    // 校验表单
    if (!formRef) return
    const valid = await formRef.value.validate()
    if (!valid) return
    formData.dict_type = store.queryParamsDict.type
    console.log(formData)
    try {
        const response = await post('/createDictData', formData);
        store.getListDataDict()
        store.visible = false
        ElMessage.success('添加成功')
    } catch (error) {
        console.error('请求出错：', error);
        ElMessage.error('添加失败')
    }
}

</script>