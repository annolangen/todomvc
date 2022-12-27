import { html, render } from '../node_modules/lit-html/lit-html';
import { ref } from '../node_modules/lit-html/directives/ref';
import { Controller } from './controller';
import { Item } from './item';
import { Model, Summary } from './model';

const HASH_BY_TEXT = {
  All: '#/',
  Active: '#/active',
  Completed: '#/completed',
};

/**
 * Ensures that the given callback is called with the # anchor of the current
 * URL, initially and when the # anchor changes.
 */
export function bindHashHandler(handler: (hash: string) => void) {
  window.addEventListener('load', () => handler(window.location.hash));
  window.addEventListener('hashchange', () => handler(window.location.hash));
}

/**
 * Renders the given model as the HTML body, delegating all control back to
 * the given controller.
 */
export function renderBody(model: Model, controller: Controller) {
  const summary: Summary = controller.count();
  const currentHash = window.location.hash;

  function addItem({ target }: { target: HTMLInputElement }) {
    const title = target.value.trim();
    if (title) {
      target.value = '';
      controller.addTodo(title);
    }
  }
  function itemHtml({ id, completed, title }: Item) {
    const liClass =
      model.editing && model.editing === id
        ? 'editing'
        : completed
          ? 'completed'
          : '';
    const toggleCompleted = () =>
      controller.updateTodo({ id, completed: !completed });
    function keyup({ code }: KeyboardEvent) {
      if (code === 'Escape') {
        delete model.editing;
        renderBody(model, controller);
      }
    }
    function keypress({ target, code }: KeyboardEvent) {
      if (code === 'Enter') {
        (target as HTMLInputElement).blur();
      }
    }
    function blur({ target }: { target: HTMLInputElement }) {
      if (model.editing === id) {
        const title = target.value.trim();
        if (title) {
          controller.updateTodo({ id, title });
        } else {
          controller.deleteTodo(id);
        }
      }
    }
    function focusInput(e?: Element) {
      if (e && model.editing === id) {
        const input = e as HTMLInputElement;
        input.focus();
        input.setSelectionRange(title.length, title.length);
      }
    }

    return html`
<li class=${liClass}>
  <div class="view">
    <input class="toggle" type="checkbox" .checked=${completed} @change=${toggleCompleted}>
    <label @dblclick=${() => renderBody({ ...model, editing: id }, controller)}>${title}</label>
    <button class="destroy" @click=${() => controller.deleteTodo(id)}></button>
  </div>
  <input class="edit" value=${title} @keyup=${keyup} @keypress=${keypress} @blur=${blur} ${ref(focusInput)}> 
  </input>
</li>`;
  }

  function filterHtml(text: string) {
    const hash = HASH_BY_TEXT[text];
    const selected = currentHash ? currentHash === hash : text === 'All';
    return html`
      <li><a class=${selected ? 'selected' : ''} href=${hash}>${text}</a></li>
    `;
  }
  render(
    html`
      <section class="todoapp">
        <header class="header">
          <h1>todos</h1>
          <input
            class="new-todo"
            placeholder="What needs to be done?"
            autofocus
            @change=${addItem}
          />
        </header>
        <section class="main" style=${summary.total ? '' : 'display:none'}>
          <input
            id="toggle-all"
            class="toggle-all"
            type="checkbox"
            .checked=${!summary.active}
            @change=${() => controller.setCompletedAllTodos(!!summary.active)}
          />
          <label for="toggle-all">Mark all as complete</label>
          <ul class="todo-list">
            ${model.todoList.map(itemHtml)}
          </ul>
        </section>
        <footer class="footer" style=${summary.total ? '' : 'display:none'}>
          <span class="todo-count">
            <strong>${summary.active}</strong>
            item${summary.active === 1 ? '' : 's'} left
          </span>
          <ul class="filters">
            ${['All', 'Active', 'Completed'].map(filterHtml)}
          </ul>
          <button
            class="clear-completed"
            style=${summary.completed ? '' : 'display:none'}
            @click=${() => controller.deleteCompleted()}
          >
            Clear completed
          </button>
        </footer>
      </section>
      <footer class="info">
        <p>Double-click to edit a todo</p>
        <p>Created by Anno Langen</p>
      </footer>
    `,
    document.body
  );
}
