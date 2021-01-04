export default function defined(o = {}) {
  for (let k in o) {
    const v = o[k];
    if (v === null || v === undefined) {
      throw new Error(`${k} is required`);
    }
  }
  return true;
}
