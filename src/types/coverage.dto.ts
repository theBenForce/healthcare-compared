import { ulid } from 'ulidx';
import z from 'zod';
import { BaseSchema } from './base.dto';

export const CoverageType = z.union([
  z.literal('copay'),
  z.literal('percent'),
]);

export type CoverageType = z.infer<typeof CoverageType>;

export const CoverageValue = z.object({
  type: CoverageType.default('percent'),
  amount: z.number().min(0).default(100),
});

export type CoverageValue = z.infer<typeof CoverageValue>;

export const CoverageSchema = BaseSchema.extend({
  id: z.string().default(() => ulid()),
  planId: z.string().ulid().or(z.null()).default(null),
  categoryId: z.string().ulid().or(z.null()).default(null),
  isInNetwork: z.boolean().optional(),
  beforeDeductible: CoverageValue.default(CoverageValue.parse({})),
  afterDeductible: CoverageValue.default(CoverageValue.parse({})),
  type: z.literal('coverage'),
});

export type CoverageSchema = z.infer<typeof CoverageSchema>;