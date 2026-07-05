export const CATEGORY_KINDS = ['income', 'expense'] as const;

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export interface Category {
  id: string;
  userId: string;
  name: string;
  kind: CategoryKind;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Seeded for every new user so the app is usable immediately after sign-up. */
export const DEFAULT_CATEGORIES: ReadonlyArray<Pick<Category, 'name' | 'kind' | 'color'>> = [
  { name: 'Salário', kind: 'income', color: '#16a34a' },
  { name: 'Freelance', kind: 'income', color: '#0d9488' },
  { name: 'Investimentos', kind: 'income', color: '#0284c7' },
  { name: 'Outras receitas', kind: 'income', color: '#64748b' },
  { name: 'Alimentação', kind: 'expense', color: '#ea580c' },
  { name: 'Moradia', kind: 'expense', color: '#9333ea' },
  { name: 'Transporte', kind: 'expense', color: '#2563eb' },
  { name: 'Saúde', kind: 'expense', color: '#dc2626' },
  { name: 'Educação', kind: 'expense', color: '#ca8a04' },
  { name: 'Lazer', kind: 'expense', color: '#db2777' },
  { name: 'Compras', kind: 'expense', color: '#7c3aed' },
  { name: 'Assinaturas', kind: 'expense', color: '#0891b2' },
  { name: 'Outros gastos', kind: 'expense', color: '#6b7280' },
];
