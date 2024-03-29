import { AxiosRequestConfig } from "../type";
import { isPlainObject, deepMerge } from "../helpers/util";

// val2代表自定义配置
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}

function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}

// 复杂对象合并策略
function deepMergeStrat(val1: any, val2: any): any {
  if(isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 !== 'undefined') {
    return val1
  }
}

const strats = Object.create(null)

// 直接取val2
const stratKeysFromVal2 = ['url', 'data', 'params']
stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

// 对headers执行深度合并策略
const stratKeysDeepMerge = ['headers']
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})



export default function mergeConfig(config1: AxiosRequestConfig, config2?: AxiosRequestConfig): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }

  const config = Object.create(null)
  
  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }

  return config
}