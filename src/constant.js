const masterClusterList = {
  'dev-int': 0,
  'local': 5,
}
const releaseClusterList = {
  'dev': 1,
  'deva': 2,
  'devb': 3,
  'go': 4
}
export const ClusterList = Object.assign({}, masterClusterList, releaseClusterList)

export function getClusterNameByKey (key) {
  return Object.keys(ClusterList).find(cluster => key === ClusterList[cluster]) || ''
}

export const PlanList = {
  'meeting': 0,
  'zoom_phone': 1,
  'zoom_room': 2,
  'webinar': 3,
  'zoom_events': 4,
  'zoom_united': 5,
  'large_meeting': 6,
  'cloud_recording': 7,
  'audio': 8,
  'conference_room_connector': 9,
  'hardware': 10,
  'video_sdk': 11,
  'free_trial': 12,
}

export function getPlanNameByKey (val) {
  return formatKey(Object.keys(PlanList).find(planName => val === PlanList[planName])) || ''
}

export const requiredRule = (fieldName) => {
  return {required: true, message: `${fieldName} is required`}
}

export function formatKey (val) {
  function formatWord (word) {
    if (['cc', 'sdk'].includes(word.toLowerCase())) {
      return word.toUpperCase()
    }
    let firstLetter = word.substr(0, 1).toUpperCase(), otherLetter = word.substr(1).toLowerCase()
    return firstLetter + otherLetter
  }
  let arr = val.split(/\s|_/)
  return arr.map(s => formatWord(s)).join(' ')
}

export const AccountType = {
  paid: 1,
  free_with_cc: 2,
  free_without_cc: 3,
  master_account: 4,
  sub_account: 5,
  free_trial: 6
}

export function getAccountTypeNameByKey (key) {
  return formatKey(Object.keys(AccountType).find(type => key === AccountType[type])) || ''
}

export class Account {
  constructor (consObj) {
    let obj = consObj || {}
    this.id = obj.id || null
    this.email = obj.email || ''
    this.cluster = this.isValidCluster(obj.cluster) ? obj.cluster : null
    if (this.cluster >= 0) {
      this.clusterName = getClusterNameByKey(this.cluster)
    }
    this.password = obj.password || ''
    this.plans = obj.plans || []
    if (this.plans.length > 0) {
      this.planNames = this.plans.map(planCode => getPlanNameByKey(planCode))
      this.hasFreeTrial = this.plans.includes(plan => plan === PlanList.free_trial)
    }
    this.isFreeAccount = obj.isFreeAccount || false
    this.freeWithCC = obj.freeWithCC || false
    this.description = obj.description || ''
    // master account
    this.isMasterAccount = obj.isMasterAccount || false
    this.hasSubAccount = obj.hasSubAccount || false
    this.isSubAccount = obj.isSubAccount || false

    this.initAccountType()
  }
  isValidCluster (val) {
    return (typeof val === 'number' && getClusterNameByKey(val))
  }
  initAccountType () {
    this.accountType = []
    if (this.plans.length > 0 && !this.hasFreeTrial) {
      this.accountType.push(AccountType.paid)
    } else if (this.plans.length > 0 && this.hasFreeTrial) {
      this.accountType.push(AccountType.free_trial)
    } else if (this.plans.length === 0 || this.isFreeAccount) {
      this.accountType.push(this.freeWithCC ? AccountType.free_with_cc : AccountType.free_without_cc)
    }
    if (this.isMasterAccount) {
      this.accountType.push(AccountType.master_account)
    } else if (this.isSubAccount) {
      this.accountType.push(AccountType.sub_account)
    }
  }
}

export function copyTo (text) {
  let tmpInput = document.createElement('textarea')
  tmpInput.value = text
  document.body.appendChild(tmpInput)
  tmpInput.select()
  document.execCommand("Copy")
  tmpInput.remove()
}

export function downloadFile (fileName, content) {
  var aLink = document.createElement("a")
  aLink.href = `data:text/plain;charset=utf-8,${content}`;
  aLink.download = fileName;
  document.body.append(aLink)
  aLink.click()
  document.body.removeChild(aLink)
}

/* eslint-disable */
Date.prototype.format = function (fmt) {
  /* eslint-disable */
    var o = {
      'M+': this.getMonth() + 1, // 月份
      'd+': this.getDate(), // 日
      'h+': this.getHours(), // 小时
      'm+': this.getMinutes(), // 分
      's+': this.getSeconds(), // 秒
      'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
      S: this.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return fmt
  }