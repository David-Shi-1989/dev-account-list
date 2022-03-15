const masterClusterList = {
  'dev-int': 0
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
  'Meeting': 0,
  'Zoom Phone': 1,
  'Zoom Room': 2,
  'Webinar': 3,
  'Zoom Events': 4,
  'Zoom United': 5,
  'Large Meeting': 6,
  'Cloud Recording': 7,
  'Audio': 8
}

export function getPlanNameByKey (val) {
  return Object.keys(PlanList).find(planName => val === PlanList[planName]) || ''
}

export const requiredRule = (fieldName) => {
  return {required: true, message: `${fieldName} is required`}
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
    }
    this.isFreeAccount = obj.isFreeAccount || false
    this.isWithoutCC = obj.isWithoutCC || false
    this.description = obj.description || ''
    // master account
    this.isMasterAccount = obj.isMasterAccount || false
    this.hasSubAccount = obj.hasSubAccount || false
    this.isSubAccount = obj.isSubAccount || false
  }
  isValidCluster (val) {
    return (typeof val === 'number' && getClusterNameByKey(val))
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
  var blob = new Blob([content])
  var evt = document.createEvent("HTMLEvents")
  evt.initEvent("click", false, false)
  aLink.download = fileName
  aLink.href = URL.createObjectURL(blob)
  aLink.dispatchEvent(evt)
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