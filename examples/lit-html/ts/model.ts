import { Item } from './item';

export interface Model {
  todoList: Item[];
  editing?: number; // ID of an item being edited
}

export interface Summary {
  total: number;
  active: number;
  completed: number;
}
