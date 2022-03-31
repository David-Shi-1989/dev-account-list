<template>
  <a-modal v-model:visible="isShow" :width="680"
    @close="onModalClose"
    ok-text="Import" cancel-text="Cancel"
    :esc-to-close="false" :mask-closable="false">
    <template #title>Import Data</template>
    <div class="import-body">
      <input type="file" :id="uploadId" accept=".json" @change="onUploadChange"/>
      <div v-if="hasUploadFile">
        <ul class="file-list">
          <li v-for="(file,idx) in fileList" :key="idx" :class="{
            'file-success': fileStatus[idx] == uploadFileStatus.success,
            'file-fail': fileStatus[idx] == uploadFileStatus.fail,
          }">
            <p>
              <icon-file class="file-icon" />
              <span class="file-name">{{file.name}}</span>
            </p>
            <p class="file-size">
              <span style="margin-right: 5px;">{{fileSize(file.size)}}</span>
              <span style="display:inline-block;width:30px;">
                <a-button type="text" shape="circle" size="mini"
                  v-if="fileStatus[idx]===uploadFileStatus.wait"
                  @click="onFileDelete(idx)">
                  <template #icon>
                    <icon-delete />
                  </template>
                </a-button>
                <icon-refresh v-if="fileStatus[idx]===uploadFileStatus.pending" spin style="width:24px;"/>
                <a-tooltip v-if="fileStatus[idx]===uploadFileStatus.success" :disabled="!fileErrorText[idx]" :content="fileErrorText[idx]">
                  <icon-check-circle style="fontSize:16px;color:green;"/>
                </a-tooltip>
                <a-tooltip v-if="fileStatus[idx]===uploadFileStatus.fail" :content="fileErrorText[idx] || 'Fail to parse file content.'">
                  <icon-close-circle style="fontSize:16px;color:red;"/>
                </a-tooltip>
              </span>
            </p>
          </li>
        </ul>
      </div>
      <div v-else id="import_uploader" @click="onUploadClick">
        <div class="d-flex flex-column align-center just-center">
          <icon-upload :size="32"/>
          <p>Click or drag file here</p>
        </div>
      </div>
    </div>
    <template #footer>
      <a-button size="small" @click="isShow=false" :disabled="loading">Cancel</a-button>
      <a-button v-if="finishImport" :disabled="!hasUploadFile" size="small" type="primary" :loading="loading" @click="onCloseBtn">Close</a-button>
      <a-button v-else :disabled="!hasUploadFile" size="small" type="primary" :loading="loading" @click="onImportBtn">Import</a-button>
    </template>
  </a-modal>
</template>

<script>
import {importData} from '@/data'
const uploadFileStatus = {
  wait: 0,
  pending: 1,
  success: 2,
  fail: 3
}
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      isShow: false,
      fileList: [],
      inputFiles: [],
      fileStatus: [],
      fileCotentObj: [],
      fileErrorText: [],
      fileImportResult: [],
      uploadId: "import_file_upload",
      loading: false,
      importData: null,
      finishImport: false,
      uploadFileStatus
    }
  },
  methods: {
    uploadInputEl () {
      return document.getElementById(this.uploadId)
    },
    onUploadClick () {
      this.uploadInputEl().click()
    },
    onUploadChange () {
      this.inputFiles = this.uploadInputEl().files;
      this.fileList = []
      this.fileStatus = []
      this.fileCotentObj = []
      this.fileErrorText = []
      this.fileImportResult = []
      for (let i = 0; i < this.inputFiles.length; i++) {
        this.fileStatus.push(uploadFileStatus.wait)
        this.fileList.push(this.inputFiles.item(i))
        this.fileCotentObj.push(null)
        this.fileErrorText.push("")
        this.fileImportResult.push(null)
      }
    },
    onFileDelete (index) {
      this.fileList.splice(index, 1)
      this.fileStatus.splice(index, 1)
      this.fileCotentObj.splice(index, 1)
      this.fileErrorText.splice(index, 1)
      this.fileImportResult.splice(index, 1)
    },
    async onImportBtn () {
      for (let i = 0; i < this.fileList.length; i++) {
        await this.parseFile(i)
      }
      this.finishImport = true
    },
    async parseFile (index) {
      this.fileStatus[index] = uploadFileStatus.pending
      let me = this
      return new Promise(resolve => {
        me.readFileContent(me.fileList[index]).then(obj => {
          me.fileCotentObj[index] = obj
          let importResult = importData(obj)
          if (importResult.result) {
            me.fileStatus[index] = uploadFileStatus.success
            me.fileErrorText[index] = `Import ${importResult.successRecordCount} success.`
              + (importResult.conflictRecordCount > 0 ? `${importResult.conflictRecordCount} failed.` : '');
            me.fileImportResult[index] = true
            resolve(true)
          } else {
            me.fileStatus = uploadFileStatus.fail
            me.fileErrorText[index] = importResult.errorMsg
          }
        }).catch(err => {
          me.fileErrorText[index] = err
          me.fileStatus[index] = uploadFileStatus.fail
          resolve(false)
        })
      })
    },
    readFileContent (file) {
      return new Promise((resolve, reject) => {
        try {
          var reader = new FileReader();
          reader.readAsText(file, 'utf-8');
          reader.onload = function (param) {
            try {
              let obj = JSON.parse(param.target.result)
              if (typeof obj === 'object') {
                resolve(obj)
              } else {
                reject("Fail to parse file content.")
              }
            } catch (err) {
              reject("Fail to parse file content.")
            }
          }
        } catch (err) {
          console.error(err)
          reject("Fail to read file.3")
        }
      })
    },
    onCloseBtn () {
      this.isShow = false
    },
    onModalClose () {
      let el = this.uploadInputEl()
      el.value = '';
      this.fileList = []
    },
    // filters
    fileSize (val) {
      let b = val
      if (b < 1024) {
        return `${b} B`
      }
      let kb = parseFloat((b / 1024).toFixed(1))
      if (kb < 1024) {
        return `${kb} KB`
      }
      let mb = parseFloat((b / (1024 * 1024).toFixed(1)))
      if (mb < 1024) {
        return `${mb} MB`
      }
      let gb = parseFloat((b / (1024 * 1024 * 1024).toFixed(1)))
      return `${gb} GB`
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
      if (!val) {
        if (this.fileImportResult.some(result => result === true)) {
          this.$emit('data-change')
        }
      }
    }
  },
  computed: {
    hasUploadFile () {
      return this.fileList.length > 0
    }
  }
}
</script>

<style lang="scss" scoped>
.import-body {
  height: 170px;
  input[type='file'] {
    display: none;
  }
  #import_uploader {
    background-color: rgb(247,248,250);
    border: 1px dashed rgb(229,230,235);
    border-radius: 2px;
    transition: all .2s ease;
    padding: 50px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: rgb(229,230,235);
      border-color: rgb(201,205,212);
    }
  }
  .file-list {
    padding: 0;
    margin: 0;
    & > li {
      display: flex;
      justify-content: space-between;
      $color:#666;
      line-height: 24px;
      svg.file-icon {
        color: $color;
        font-size: 16px;
        margin-right: 5px;
      }
      .file-name {
        font-size: 12px;
        color: $color;
      }
      .file-size {
        font-size: 12px;
        color: $color;
      }
      &.file-success {
        svg.file-icon, .file-name, .file-size {
          color: green;
        }
      }
      &.file-fail {
        svg.file-icon, .file-name, .file-size {
          color: red;
        }
      }
    }
  }
}

</style>
