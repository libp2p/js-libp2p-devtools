
export interface DeferredPromise<R = void> {
  resolve(val?: R): void
  reject(reason: Error): void
  promise: Promise<R>
}

export function defer <R = void> (): DeferredPromise<R> {
  // @ts-expect-error not in default typescript types yet
  return Promise.withResolvers<void>()
}
