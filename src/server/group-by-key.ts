const groupByKey = <T>(array: Array<T>, key: keyof T) => {
  return array.reduce((acc, cur) => {
    const hash = cur[key] as string;
    if (!acc.has(hash)) {
      acc.set(hash, []);
    }
    acc.get(hash)?.push(cur);
    return acc;
  }, new Map<string, T[]>());
}

export default groupByKey;