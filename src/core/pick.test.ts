import { pick } from "./pick";

describe("pick function", () => {
  it("should pick top-level fields", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = pick(obj, ["a", "c"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("should pick nested fields", () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };
    const result = pick(obj, ["a", "b.c", "b.d.e"]);
    expect(result).toEqual({ a: 1, b: { c: 2, d: { e: 3 } } });
  });

  it("should return an empty object when no fields match", () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, JSON.parse(JSON.stringify(["c"])));
    expect(result).toEqual({});
  });

  it("should handle array fields", () => {
    const obj = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
      },
    };
    const result = pick(obj, ["a", "b.c"]);
    expect(result).toEqual({ a: [1, 2, 3], b: { c: [4, 5, 6] } });
  });

  it("should handle edge cases like null and undefined", () => {
    const obj = {
      a: null,
      b: undefined,
    };
    const result = pick(obj, ["a", "b"]);
    expect(result).toEqual({ a: null, b: undefined });
  });
});
