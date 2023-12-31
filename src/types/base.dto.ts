import { z } from 'zod';
import { ulid } from 'ulidx';

export const TableNames = z.enum(['plan', 'person', 'category', 'expense', 'coverage']);

export type TableNames = z.infer<typeof TableNames>;

export const BaseSchema = z.object({
  id: z.string().ulid().default(() => ulid()),
  isDeleted: z.boolean().optional(),
  type: TableNames.or(z.literal('deleted')),
  updatedAt: z.date().or(z.string({ coerce: true }).datetime()).optional().default(() => new Date().toISOString()).transform(value => {
    if (typeof value !== 'string') return value.toISOString();
  }),
}).passthrough();

export type BaseSchema = z.infer<typeof BaseSchema>;

export const NamedSchema = BaseSchema.extend({
  name: z.string().min(3).max(255).default('Unnamed'),
  description: z.string().min(3).max(255).optional(),
}).passthrough();

export type NamedSchema = z.infer<typeof NamedSchema>;

