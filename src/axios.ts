import { AxiosRequestConfig, AxiosInstanceStatic } from "./type";
import Axios from "./core/Axios";
import { extend } from "./helpers/util";
import defaults from "./defaults";
import mergeConfig from "./core/mergeConfig";
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

// 工厂方法
function createInstance(config: AxiosRequestConfig): AxiosInstanceStatic {
  const context = new Axios(config)
  const instance = Axios.prototype.request.bind(context)

  // 将所有属性方法都拷贝到instance上
  extend(instance, context)

  return instance as AxiosInstanceStatic
}

const axios = createInstance(defaults)

axios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config))
}
axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

export default axios