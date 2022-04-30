<template>
  <a-modal v-model:visible="isShow" :width="680"
    @before-ok="handleCreateEditModalOk" @beforeOpen="onModalBeforeOpen"
    @cancel="handleCreateEditModalCancel" @close="onModalClose" 
    :ok-text="ctaBtnText" cancel-text="Cancel"
    :esc-to-close="false" :mask-closable="false">
    <template #title>Add Account</template>
    <div class="overflow-scroll form-wrap" style="max-height: 400px;">
      <a-form ref="createForm" :model="form" :auto-label-width="true" class="create-edit-form">
        <a-form-item field="cluster" label="Cluster" :rules="rules.cluster">
          <a-select v-model="form.cluster">
            <a-option v-for="(val, key) in ClusterList" :key="val" :value="val">{{ key }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="email" label="Email" :rules="rules.email">
          <a-input v-model="form.email"></a-input>
        </a-form-item>
        <a-form-item field="password" label="Password" :rules="rules.password">
          <a-input-password v-model="form.password" allow-clear />
        </a-form-item>
        <a-form-item field="description" label="Description">
          <a-textarea v-model="form.description" :max-length="255" show-word-limit/>
        </a-form-item>
        <a-form-item label="Is Free Account">
          <a-checkbox v-model="form.isFreeAccount"></a-checkbox>
        </a-form-item>
        <a-form-item v-if="form.isFreeAccount" label="Has Credit Card">
          <a-switch type="round" size="small" v-model="form.freeWithCC"/>
        </a-form-item>
        <div class="more-config-switch">
          <a-button type="text" @click="showMoreConfig=!showMoreConfig">
            <template #icon>
              <icon-down v-if="showMoreConfig" />
              <icon-right v-else />
            </template>
            <template #default>
              <template v-if="showMoreConfig">
                Show Less Configurations
              </template>
              <template v-else>
                Show More Configurations
              </template>
            </template>
          </a-button>
        </div>
        <template v-if="showMoreConfig">
          <a-divider orientation="center">Plan</a-divider>
          <a-form-item label="Plan Config">
            <a-checkbox-group class="plan-checkbox" v-model="form.plans">
              <a-checkbox v-for="({key, value}) in PlanList" :key="value" :value="value">{{capitalFilter(key)}}</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-divider orientation="center">Master/Sub Account</a-divider>
          <a-form-item label="Is Master Account">
            <a-checkbox v-model="form.isMasterAccount"></a-checkbox>
          </a-form-item>
          <a-form-item label="Has Sub Account">
            <a-checkbox v-model="form.hasSubAccount"></a-checkbox>
          </a-form-item>
        </template>
      </a-form>
    </div>
  </a-modal>
</template>

<script>
import {ClusterList, PlanList, requiredRule, Account} from '@/constant.js';
import {addAccount, generateID, getAccountById, editAccount} from '@/data/index.js';
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  data () {
    let form = new Account()
    return {
      isShow: false,
      form,
      rules: {
        cluster: [
          requiredRule('Cluster')
        ],
        email: [
          requiredRule('Email'),
          {type: 'email'}
        ],
        password: [
          requiredRule('Password')
        ],
      },
      showMoreConfig: false,
      ClusterList,
      PlanList
    }
  },
  methods: {
    // modal
    async handleCreateEditModalOk (done) {
      let isSuccess = await this.addAccountBtn()
      if (isSuccess) {
        this.$message.success(this.ctaBtnText + ' Success!')
        this.$emit('initData')
      } else {
        this.$message.error(this.ctaBtnText + ' Fail!')
      }
      return done()
    },
    handleCreateEditModalCancel () {
      this.isShow = false
    },
    onModalClose () {
      this.$refs.createForm.resetFields()
      let initialForm = new Account()
      for (let field in initialForm) {
        this.form[field] = initialForm[field]
      }
      this.showMoreConfig = false
    },
    onModalBeforeOpen () {
      if (this.id) {
        getAccountById(this.id).then(data => {
          Object.assign(this.form, data)
        })
      }
      this.$nextTick(() => {
        document.querySelector('.overflow-scroll.form-wrap').scrollTop = 0
      })
    },
    getFormData () {
      var obj = Object.assign({}, this.form)
      if (this.isEdit) {
        obj.id = this.id
      } else {
        obj.id = generateID()
      }
      return obj
    },
    addAccountBtn () {
      let me = this
      return new Promise((resolve) => {
        (me.isEdit ? editAccount : addAccount)(me.getFormData()).then(res => {
          resolve(res.result)
        })
      })
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler (val) {
        this.isShow = !!val
      }
    },
    isShow (val) {
      this.$emit("update:visible", !!val)
    }
  },
  computed: {
    isEdit () {
      return !!this.id
    },
    ctaBtnText () {
      return this.isEdit ? 'Save' : 'Add'
    }
  }
}
</script>

<style lang="scss" scoped>
$label-width: 140px;
.create-edit-form {
  .arco-form-item:deep(.arco-form-item-label-col-flex) {
    flex: 0 0 $label-width !important;
  }
}
.plan-checkbox {
  display: flex;
  flex-wrap: wrap;
  label.arco-checkbox {
    display: block;
    flex: 0 0 50%;
    margin-right: 0;
    margin-bottom: 10px;
    &:deep(.arco-checkbox-label) {
      font-size: 13px;
    }
  }
}
.more-config-switch {
  span {
    margin-left: 10px;
  }
}

.arco-divider:deep(.arco-divider-text) {
  color: #888;
}
</style>
