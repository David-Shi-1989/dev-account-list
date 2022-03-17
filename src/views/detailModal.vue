<template>
  <a-modal v-model:visible="isShow" title="Account Information" :width="850"
    @ok="isShow=false" @cancel="isShow=false"
    @beforeOpen="onModalBeforeOpen"
  >
  <div class="account-detail">
    <h5>Basic Information</h5>
    <ul>
      <li class="full-row">
        <p>Cluster</p><p>{{account.clusterName}}</p>
      </li>
      <li class="half-row">
        <p>Email</p><p>{{account.email}}</p>
      </li>
      <li class="half-row">
        <p>Password</p><p>{{account.password}}</p>
      </li>
      <li class="full-row">
        <p>Description</p>
        <p>
          <template v-if="account.description">
            {{account.description}}
          </template>
          <template v-else>
            <icon-empty class="empty-icon"/>
          </template>
        </p>
      </li>
    </ul>
    <h5>Plans</h5>
    <ul>
      <li class="full-row">
        <p>Subscription(s)</p>
        <p class="sub-list">
          <a-tag v-for="s in account.planNames" :key="s" color="blue">{{s}}</a-tag>
        </p>
      </li>
    </ul>
  </div>
  </a-modal>
</template>

<script>
import {getAccountById} from '@/data';
import {Account} from '@/constant.js';
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
    let account = new Account()
    return {
      isShow: false,
      account
    }
  },
  methods: {
    onModalBeforeOpen () {
      let me = this
      getAccountById(this.id).then(res => {
        me.account = new Account(res)
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
}
</script>

<style lang="scss" scoped>
$gray-text-color: rgb(169, 171, 173);
.account-detail {
  h5 {
    font-weight: 500;
    font-size: 16px;
    margin: 5px 0;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    & > li {
      margin: 0;
      display: flex;
      align-items: baseline;
      align-self: baseline;
      border-radius: 3px;
      margin: 3px 0;
      &.full-row {
        flex: 0 0 100%;
      }
      &.half-row {
        flex: 0 0 50%;
      }
      &:hover {
        background-color: #f8f8f8;
      }
      & > p {
        margin: 0;
        padding: 5px 0;
        word-break: break-all;
        &:first-child {
          color: $gray-text-color;
          flex: 0 0 120px;
          text-align: right;
          margin-right: 10px;
          &::after {
            content: ":";
            margin: 0 3px;
          }
        }
        &:last-child {
          color: rgb(29,33,41);
          .empty-icon {
            color: $gray-text-color;
            font-size: 16px;
          }
        }
      }
    }
  }
  .sub-list {
    & > span {
      margin-bottom: 8px;
      &:not(:last-child) {
        margin-right: 12px;
      }
    }
  }
}
</style>
