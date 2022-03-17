import {formatKey} from '@/constant'
export default {
  methods: {
    capitalFilter (val) {
      return formatKey(val)
    }
  }
}