type NestedKeys<T> = {
  [K in keyof T]: K extends string
    ? `${K}` | `${K}.${NestedKeys<T[K]>}`
    : never;
}[keyof T] extends infer X
  ? X extends string
    ? X
    : never
  : never;

function getNestedValue<T, K extends NestedKeys<T>>(obj: T, key: K): unknown {
  return (key as string)
    .split(".")
    .reduce(
      (o: unknown, k: string) =>
        o && typeof o === "object" && k in o
          ? (o as Record<string, unknown>)[k]
          : undefined,
      obj,
    );
}

function setNestedValue<T, K extends NestedKeys<T>>(
  obj: T,
  path: K,
  value: unknown,
): void {
  const keys = (path as string).split(".");
  let current: unknown = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current === "object" && current !== null && !(key in current)) {
      (current as Record<string, unknown>)[key] = {};
    }
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === "object" && current !== null) {
    (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
  }
}

export function pick<T>(obj: T, whitelist: Array<NestedKeys<T>>): Partial<T> {
  return whitelist.reduce((newObj, key) => {
    const value = getNestedValue(obj, key);
    if (value !== undefined) {
      setNestedValue(newObj, key, value);
    }
    return newObj;
  }, {} as Partial<T>);
}
