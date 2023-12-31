import z from 'zod';

export const ReportPlan = z.object({
  planId: z.string().ulid(),
  name: z.string(),
  expenses: z.number(),
  discount: z.number().default(0),
  premiums: z.number(),
  total: z.number()
});

export type ReportPlan = z.infer<typeof ReportPlan>;

export const CostReport = z.array(ReportPlan);

export type CostReport = z.infer<typeof CostReport>;
