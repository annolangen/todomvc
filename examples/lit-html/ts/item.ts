export interface Item {
  id: number;
  title: string;
  completed: boolean;
}

export type ItemQuery = { id: number } | { completed: boolean } | {};
export const ALL_ITEMS: ItemQuery = {};
export type ItemUpdate =
  | { id: number; title: string }
  | { id: number; completed: boolean };
