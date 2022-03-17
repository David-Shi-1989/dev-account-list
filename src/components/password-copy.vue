<template>
  <div class="psw-copy">
    <p :style="{maxWidth:textWidth+'px'}">{{value}}</p>
    <a-button type="text" size="mini" @click="onCopyBtn" title="copy">
      <template #icon>
        <icon-copy />
      </template>
    </a-button>
  </div>
</template>
<script>
import {copyTo} from '@/constant'
export default {
  props: {
    value: {
      type: String
    },
    textWidth: {
      type: Number,
      default: 200
    }
  },
  methods: {
    onCopyBtn () {
      copyTo(this.value)
      this.$message.success("Copy success!")
    }
  }
}
</script>

<style lang="scss" scoped>
.psw-copy {
  display: flex;
  & > p {
    margin: 0 10px 0 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  & > button {
    visibility: collapse;
  }
  &:hover {
    & > button {
      visibility: visible;
    }
  }
}
</style>
