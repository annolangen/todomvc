import { Item, ItemQuery, ItemUpdate } from './item';

export interface Store {
  find: (query: ItemQuery) => Item[];
  insert: (item: Item) => void;
  update: (update: ItemUpdate) => void;
  remove: (query: ItemQuery) => void;
  updateAll: (mapFn: (todo: Item) => Item) => void;
}

const localStorage = window.localStorage;

/**
 * Returns a Store implementation backed by localStorage for the stringified todo list.
 */
export function newStore(name: string): Store {
  let cachedTodos: Item[];
  const getLocalStorage = () =>
    cachedTodos || JSON.parse(localStorage.getItem(name) || '[]');
  const modifyStorage = (updateStorage: (items: Item[]) => Item[]) =>
    localStorage.setItem(
      name,
      JSON.stringify((cachedTodos = updateStorage(getLocalStorage())))
    );
  const includer = (query: ItemQuery) => (todo: Item) =>
    Object.keys(query).every(k => query[k] === todo[k]);
  const excluder = (query: ItemQuery) => (todo: Item) =>
    Object.keys(query).some(k => query[k] !== todo[k]);
  function doUpdate(update: ItemUpdate, items: Item[]) {
    const id = update.id;
    const todo = items.find(item => item.id === id);
    if (todo) {
      Object.assign(todo, update);
    }
    return items;
  }
  return {
    find: query => getLocalStorage().filter(includer(query)),
    insert: todo => modifyStorage(items => [...items, todo]),
    remove: query => modifyStorage(items => items.filter(excluder(query))),
    update: update => modifyStorage(items => doUpdate(update, items)),
    updateAll: mapFn => modifyStorage(items => items.map(mapFn)),
  };
}
