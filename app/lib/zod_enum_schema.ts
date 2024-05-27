import { z } from "zod";

export function createEnumSchema<T extends string>(
  values: T[],
): z.ZodEnum<[T, ...T[]]> {
  return z.enum(values as [T, ...T[]]);
}
