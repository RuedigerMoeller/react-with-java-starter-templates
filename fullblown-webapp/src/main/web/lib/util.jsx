
export function toES6Prom(kpromise) {
  return new Promise((resolve, reject) => kpromise.then((r, e) => e ? reject(e) : resolve(r)));
}
