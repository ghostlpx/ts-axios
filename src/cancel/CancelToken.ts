import { CancelExecutor, CancelTokenSource, Canceler } from "../type";
import Cancel from "./Cancel";

interface ResolvePromise {
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromse: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromse = resolve
    })

    executor(message => {
      if (this.reason) return
      this.reason = new Cancel(message)
      resolvePromse(this.reason)
    })
  }

  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}