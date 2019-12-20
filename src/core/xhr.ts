import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../type'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout = 0,
      cancelToken
    } = config

    const xhrInstance = new XMLHttpRequest()

    if (responseType) {
      xhrInstance.responseType = responseType
    }
    if (timeout) {
      xhrInstance.timeout = timeout
    }

    xhrInstance.open(method.toUpperCase(), url!, true)

    xhrInstance.onreadystatechange = function handleLoad() {
      if (xhrInstance.readyState !== 4) return
      if (xhrInstance.status === 0) return

      const responseHeaders = parseHeaders(xhrInstance.getAllResponseHeaders())
      const responseData = responseType === 'text' ? xhrInstance.responseText : xhrInstance.response
      const response: AxiosResponse = {
        data: responseData,
        status: xhrInstance.status,
        statusText: xhrInstance.statusText,
        headers: responseHeaders,
        config: config,
        request: xhrInstance
      }
      handleResponse(response)
    }

    xhrInstance.onerror = function handleError() {
      reject(createError('Network Error', config, null, xhrInstance))
    }

    xhrInstance.ontimeout = function handleTimeout() {
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', xhrInstance))
    }
  
    // 设置headers
    Object.keys(headers).forEach((key) => {
      if (data === null && key.toLowerCase() === 'content-type') {
        delete headers[key]
      } else {
        xhrInstance.setRequestHeader(key, headers[key])
      }
    })

    if (cancelToken) {
      cancelToken.promise.then(reason => {
        xhrInstance.abort()
        reject(reason)
      })
    }
  
    xhrInstance.send(data)

    // 处理状态码非200的错误
    function handleResponse(response: AxiosResponse): void {
      const status = response.status
      if (status >= 200 && status < 300) {
        resolve(response)
      } else {
        reject(createError(`Request failed with status code ${status}`, config, null, xhrInstance, response))
      }
    }
  })
}