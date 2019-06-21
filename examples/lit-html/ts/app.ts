import { newController } from './controller';
import { newStore } from './store';
import { bindHashHandler, renderBody } from './view';

const controller = newController(newStore('todos-lit-html'));
bindHashHandler((hash: string) =>
  renderBody(controller.modelForHash(hash), controller)
);
