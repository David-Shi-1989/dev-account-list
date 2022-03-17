<template>
  <!-- Query Bar -->
  <div id="query_wrap">
    <a-space style="width:100%;margin-bottom:20px;" value="large">
      <a-select v-model="query.cluster" style="width:220px;" size="small" placeholder="Cluster" multiple allow-clear>
        <a-option v-for="(val, key) in ClusterList" :key="val" :value="val">{{ key }}</a-option>
      </a-select>
      <a-select v-model="query.plans" style="width:350px;" size="small" placeholder="Plans" multiple :max-tag-count="3" allow-clear>
        <a-option v-for="(val, key) in PlanList" :key="val" :value="val">{{ capitalFilter(key) }}</a-option>
      </a-select>
      <a-select v-model="query.accountType" style="width:180px;" size="small" placeholder="Account Type" multiple allow-clear>
        <a-option v-for="(val, key) in AccountType" :key="val" :value="val">{{ capitalFilter(key) }}</a-option>
      </a-select>
      <a-input v-model="query.keyword" style="width: 220px;" size="small" placeholder="Search keywords" allow-clear>
        <template #suffix>
          <icon-search />
        </template>
      </a-input>
      <a-button size="small" @click="onQueryReset">Reset</a-button>
    </a-space>
    <div>
      <a-dropdown size="small" @select="onToolDropdownSelect">
        <a-button type="text">
          <template #icon>
            <icon-more />
          </template>
        </a-button>
        <template #content>
          <a-doption value="import">
            <template #icon>
              <icon-import />
            </template>
            <template #default>Import</template>
          </a-doption>
          <a-doption value="backup">
            <template #icon>
              <icon-save />
            </template>
            <template #default>Backup</template>
          </a-doption>
        </template>
      </a-dropdown>
    </div>
  </div>
  <!-- Button Bar -->
  <a-space align="start" style="width:100%;margin-bottom:20px;">
    <!-- Add -->
    <a-button type="primary" size="small" @click="onAddBtn">
        <template #icon>
        <icon-plus />
      </template>
      <template #default>Add</template>
    </a-button>
    <!-- Delete -->
    <a-button type="primary" status="danger" size="small" :disabled="table.selectedRows.length<=0" @click="onDeleteBtn">
        <template #icon>
        <icon-delete />
      </template>
      <template #default>Delete</template>
    </a-button>
  </a-space>
  <!-- Table -->
  <a-table row-key="id"
    border stripe
    :loading="table.loading"
    :pagination="table.pagination"
    @page-change="pageChange" @page-size-change="pageSizeChange"
    @selection-change="onSelectionChange"
    :row-selection="table.rowSelection" :columns="table.columns" :data="table.data"></a-table>
  <!-- Modal -->
  <createEditModal v-model:visible="createEditModal.isShow" :id="createEditModal.id" @init-data="initData"></createEditModal>
  <detailModal v-model:visible="detailModal.isShow" v-model:id="detailModal.id"></detailModal>
</template>

<script>
import {ClusterList, PlanList, AccountType, getAccountTypeNameByKey, getClusterNameByKey, copyTo, downloadFile} from '@/constant.js';
import {getAccountByPage, removeAccounts, getAccountData, getQuery, saveQuery, cleanQuery} from '@/data/index.js';
import { createVNode } from 'vue';
import { Button, Space, Tag } from '@arco-design/web-vue';
import passwordCopy from '@/components/password-copy';
import createEditModal from './createEditModal.vue';
import detailModal from './detailModal.vue';
import {debounce} from 'lodash';

export default {
  name: 'tableList',
  components: {createEditModal, detailModal},
  data () {
    let query = Object.assign({},
      {
        cluster: [],
        plans: [],
        accountType: null,
        keyword: ''
      },
      getQuery()
    )
    return {
      query,
      table: {
        rowSelection: {type: 'checkbox'},
        loading: false,
        pagination: {
          page: 1,
          pageSize: 20,
          pageSizeOptions: [20, 40, 50, 100],
          total: 0,
          showTotal: true,
          showJumper: true,
          showPageSize: true
        },
        columns: [
          {
            title: 'Cluster',
            dataIndex: 'cluster',
            width: 100,
            render: ({record}) => {
              const {cluster} = record
              const text = getClusterNameByKey(cluster)
              return createVNode('span', {}, text)
            },
            // filterable: {
            //   filters: Object.keys(ClusterList).map(key => ({
            //     text: key,
            //     value: ClusterList[key]
            //   })),
            //   filter: (value, record) => value.includes(record.cluster),
            //   multiple: true
            // }
          },
          {
            title: 'Email',
            dataIndex: 'email',
            render: ({record}) => {
              const {email} = record
              return createVNode(passwordCopy, {
                value: email,
                textWidth: 300
              })
            }
          },
          {
            title: 'Account Type',
            render: ({record}) => {
              const {accountType} = record
              let tagArr = accountType.map(tag => {
                return createVNode(Tag, {
                  size: "mini",
                  color: "blue",
                  style: {
                    marginRight: '6px'
                  }
                }, {default: () => getAccountTypeNameByKey(tag)})
              })
              return createVNode('div', {}, tagArr)
            }
          },
          {
            title: 'Password',
            dataIndex: 'password',
            width: 200,
            render: ({record}) => {
              const {password} = record
              return createVNode(passwordCopy, {
                value: password
              })
            }
          },
          {
            title: 'Action',
            width: 200,
            render: ({record}) => {
              const editBtn = createVNode(Button, {
                size: 'mini',
                type: 'primary',
                onClick: () => {
                  this.onEditItem(record.id)
                }
              }, {
                default: () => 'Edit'
              })
              const viewBtn =  createVNode(Button, {
                size: 'mini',
                props: {
                  plain: true
                },
                onClick: () => {
                  this.onViewItem(record.id)
                }
              }, {
                default: () => 'Detail'
              })
              const shareBtn =  createVNode(Button, {
                size: 'mini',
                type: 'text',
                props: {
                  plain: true
                },
                onClick: () => {
                  this.onShareItem(record)
                }
              }, {
                default: () => 'Share'
              })
              return createVNode(Space, {}, {
                default: () => [editBtn, viewBtn, shareBtn]
              })
            }
          }
        ],
        data: [],
        selectedRows: []
      },
      createEditModal: {
        isShow: false,
        id: ''
      },
      detailModal: {
        isShow: false,
        id: ''
      },
      ClusterList,
      PlanList,
      AccountType
    }
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      this.table.loading = true
      // query
      const queryObj = {}
      if (this.query.cluster && this.query.cluster.length > 0) {
        queryObj.cluster = this.query.cluster
      }
      if (this.query.plans && this.query.plans.length > 0) {
        queryObj.plans = this.query.plans
      }
      if (this.query.accountType && this.query.accountType.length > 0) {
        queryObj.accountType = this.query.accountType
      }
      if (this.query.keyword) {
        queryObj.keyword = this.query.keyword
      }
      if (Object.keys(queryObj).length > 0) {
        saveQuery(queryObj)
      }
      getAccountByPage(this.table.pagination.page, this.table.pagination.pageSize, queryObj).then(res => {
        this.table.data = res.list
        this.table.pagination.total = res.total
        this.table.loading = false
      })
    },
    pageChange (page) {
      this.table.pagination.page = page
      this.initData()
    },
    pageSizeChange (pageSize) {
      this.table.pagination.pageSize = pageSize
      this.initData()
    },
    onAddBtn () {
      this.createEditModal.id = ''
      this.createEditModal.isShow = true
    },
    onDeleteBtn () {
      let me = this
      this.$modal.confirm({
        title: 'Delete Confirm',
        content: `Are you sure to delete ${this.table.selectedRows.length} record(s)?`,
        async onOk () {
          me.doDelete(me.table.selectedRows)
        }
      })
    },
    async doDelete (idList) {
      if(await removeAccounts(idList)) {
        this.$message.success('Delete Success!')
        this.table.selectedRows = []
        this.initData()
      } else {
        this.$message.success('Delete Fail!')
      }
    },
    async onEditItem (id) {
      this.createEditModal.isShow = true
      this.createEditModal.id = id
    },
    onViewItem (id) {
      Object.assign(this.detailModal, {
        isShow: true,
        id
      })
    },
    onShareItem (data) {
      copyTo(data.email + '\n' + data.password)
      this.$message.success("Copy success!")
    },
    onSelectionChange (list) {
      this.table.selectedRows = list
    },
    // query
    doQuery: debounce(function () {
      this.initData()
    }, 700),
    onQueryReset () {
      Object.assign(this.query, {
        cluster: [],
        plans: [],
        accountType: null,
        keyword: ''
      })
      cleanQuery()
    },
    // tools
    onToolDropdownSelect (option) {
      console.log(option)
      if (option === "backup") {
        this.doBackup()
      }
    },
    doBackup () {
      let fileName = (new Date()).format('account-backup-yyyy/MM/dd hh:mm:ss')
      let backupObj = {
        data: getAccountData(),
        datetime: Date.now()
      }
      downloadFile(fileName, JSON.stringify(backupObj))
    },
  },
  computed: {
    queryCondition () {
      return {
        cluster: this.query.cluster,
        plans: this.query.plans,
        accountType: this.query.accountType,
        keyword: this.query.keyword
      }
    }
  },
  watch: {
    queryCondition: {
      deep: true,
      handler () {
        this.doQuery()
      }
    }
  },
};
</script>
<style lang="scss" scoped>
#query_wrap {
  display: flex;
}
</style>
