import { ALL_ITEMS, ItemQuery, ItemUpdate } from './item';
import { Model, Summary } from './model';
import { Store } from './store';
import { renderBody } from './view';

export interface Controller {
  modelForHash: (hash: string) => Model;
  addTodo: (text: string) => void;
  deleteTodo: (id: number) => void;
  updateTodo: (itemUpdate: ItemUpdate) => void;
  setCompletedAllTodos: (completed: boolean) => void;
  deleteCompleted: () => void;
  count: () => Summary;
}

const QUERY_BY_HASH: { [key: string]: ItemQuery } = {
  '#/active': { completed: false },
  '#/completed': { completed: true },
};

export function newController(store: Store): Controller {
  let query: ItemQuery = ALL_ITEMS;
  let nextId =
    1 + store.find(ALL_ITEMS).reduce((max, todo) => Math.max(max, todo.id), 0);
  const controller : Controller = {
    modelForHash(hash) {
      query = QUERY_BY_HASH[hash] || ALL_ITEMS;
      return { todoList: store.find(query) };
    },
    addTodo: title =>
      showAfter(store.insert, { id: nextId++, title, completed: false }),
    deleteTodo: id => showAfter(store.remove, { id }),
    deleteCompleted: () => showAfter(store.remove, { completed: true }),
    updateTodo: itemUpdate => showAfter(store.update, itemUpdate),
    setCompletedAllTodos: completed =>
      showAfter(store.updateAll, todo => ({ ...todo, completed })),
    count() {
      const todos = store.find(ALL_ITEMS);
      const total = todos.length;
      const completed = todos.reduce(
        (sum, item) => sum + (item.completed ? 1 : 0),
        0
      );
      return { total, completed, active: total - completed };
    },
  };
  return controller;

  function showAfter<T>(fn: (arg: T) => void, arg: T) {
    fn(arg);
    renderBody({ todoList: store.find(query) }, controller);
  }
}
