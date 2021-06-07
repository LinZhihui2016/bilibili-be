export class Checkbox<T> {
  map = new Map<number, T>();
  max = 0;
  constructor(public raw: T[]) {
    raw.forEach((value, index) => {
      const key = Math.pow(2, index);
      this.map.set(key, value);
      this.max = key;
    });
  }

  unzip(value: number, emptyInit?: T[]) {
    if (!value || isNaN(value)) {
      return emptyInit || this.raw;
    }
    let i = 0;
    const arr = [];
    let v = 0;
    while (v !== this.max && v < value) {
      v = Math.pow(2, i);
      value & v && arr.push(v);
      i++;
    }
    const values = arr.map((i) => this.map.get(i));
    return values.length === 0 ? emptyInit || this.raw : values;
  }

  obj() {
    const tar = [];
    for (const [key, value] of this.map.entries()) {
      tar.push({ key, value });
    }
    return tar;
  }
}
