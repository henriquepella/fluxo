export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  /** Monthly spending limit in integer cents. */
  amountCents: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Budget joined with its category and the spending of a given month. */
export interface BudgetWithUsage extends Budget {
  categoryName: string;
  categoryColor: string;
  spentCents: number;
  /** spent/limit rounded to whole percent (can exceed 100). */
  percent: number;
}
