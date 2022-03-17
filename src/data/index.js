import {isArray} from 'lodash'
const LocalStorageKey_Account_List = '_account_list_'
import {Account} from '@/constant.js'

export function getAccountById (id) {
  return Promise.resolve(getAccountData().find(r => r.id === id) || null)
}

export function getAccountData () {
  try {
    const list = JSON.parse(localStorage.getItem(LocalStorageKey_Account_List) || '[]')
    return list.map(item => new Account (item))
  } catch(err) {
    console.error(localStorage.getItem(LocalStorageKey_Account_List))
  }
  return []
}

function saveAccountData (list) {
  localStorage.setItem(LocalStorageKey_Account_List, JSON.stringify(list))
  return true
}

export function getAccountByPage (page, size, queryObj) {
  let allList = getAccountData()
  if (Object.keys(queryObj).length > 0) {
    if (queryObj.cluster && isArray(queryObj.cluster)) {
      allList = allList.filter(item => queryObj.cluster.includes(item.cluster))
    }
    if (queryObj.plans && isArray(queryObj.plans)) {
      allList = allList.filter(item => queryObj.plans.some(searchPlan => item.plans.includes(searchPlan)))
    }
    if (queryObj.accountType) {
      // AccountType
      const {accountType} = queryObj
      allList = allList.filter(item => {
        return item.accountType.some(type => accountType.includes(type))
      })
    }
    if (queryObj.keyword && queryObj.keyword.trim()) {
      let keyword = queryObj.keyword.trim().toLowerCase()
      allList = allList.filter(item => (item.email.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)))
    }
  }
  const startIdx = (page - 1) * size
  const endIdx = startIdx + size
  return Promise.resolve({
    list: allList.slice(startIdx, endIdx),
    page,
    size,
    startIdx,
    endIdx,
    total: allList.length
  })
}

export function addAccount (account) {
  const list = getAccountData()
  list.unshift(account)
  return Promise.resolve({
    result: saveAccountData(list)
  })
}

export function editAccount (account) {
  console.assert(account.id)
  const allList = getAccountData()
  allList.some(item => {
    if (item.id === account.id) {
      Object.assign(item, account)
      return true
    } else {
      return false
    }
  })
  return Promise.resolve({
    result: saveAccountData(allList)
  })
}

export function removeAccounts (idList) {
  console.assert(isArray(idList))
  const allList = getAccountData().filter(item => !idList.includes(item.id))
  return Promise.resolve({
    result: saveAccountData(allList)
  })
}

export function generateID () {
  return Date.now()
}