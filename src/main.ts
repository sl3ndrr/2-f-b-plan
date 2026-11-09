import { data } from 'virtual:study-data';
import { progress } from './domain/progress';
import { createStore } from './state/store';
import { connectBackup, ignoredIdsLabel } from './ui/backupControls';
import { createChecklist } from './ui/checklist';
import { burst } from './ui/confetti';
import { element, get } from './ui/dom';
import { createHero } from './ui/hero';
import { createModuleList } from './ui/moduleList';
import { connectMotion } from './ui/motion';
import { formatProgressReport } from './ui/progressReport';
import { connectTheme } from './ui/theme';
import { createTiles } from './ui/tiles';
import { createToast } from './ui/toast';
import { connectToolbar } from './ui/toolbar';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/hero.css';
import './styles/tiles.css';
import './styles/module-list.css';
import './styles/module-row.css';
import './styles/feedback.css';
import './styles/motion.css';
import './styles/print.css';

const storage = () => localStorage;
const store = createStore(data, storage);
const toast = createToast(get('#toast'));
const printReport = get('#printReport');
connectTheme(storage);
connectBackup(store, toast);
const summary = get('#dyn');
const listRoot = get('#list');
const hero = createHero(data, summary);
const animationRunning = connectMotion(hero.node, storage);
const celebrate = () => {
  if (animationRunning()) burst(data.categories.map(({ colorToken }) => colorToken));
};
const tiles = createTiles(data, summary, (id) => {
  const category = store.get().filter.category === id ? null : id;
  store.setFilter({ category });
  if (category) listRoot.scrollIntoView({ behavior: animationRunning() ? 'smooth' : 'instant' });
});
const checklist = createChecklist(data, summary);
const list = createModuleList(
  data,
  listRoot,
  (id, exclusive) => {
    const before = progress(data, store.get()).total;
    if (exclusive) store.choose(id);
    else store.toggle(id);
    if (animationRunning()) list.highlight(id);
    if (before.remaining && !progress(data, store.get()).total.remaining) {
      toast(`make: alle ${before.required} C erfüllt`);
      celebrate();
    }
  },
  store.clearGroup,
);
const toolbar = connectToolbar(data, store, toast, celebrate);

document.title = data.meta.title;
get('footer').append(data.meta.source, element('br'), data.meta.planNote);

function render(state: ReturnType<typeof store.get>, previous?: typeof state) {
  const status = progress(data, state);
  hero.update(status);
  tiles(status, state.filter.category);
  checklist(status);
  toolbar(state);
  printReport.textContent = formatProgressReport(data, state, status);
  if (
    !previous ||
    state.mode !== previous.mode ||
    state.filter !== previous.filter ||
    (state.done !== previous.done && state.filter.status !== 'all')
  ) {
    list.render(
      state,
      status,
      !previous ||
        (state.filter !== previous.filter && state.filter.query === previous.filter.query),
    );
  } else {
    list.sync(state, status);
  }
}

render(store.get());
store.subscribe(render);
if (store.unknown) toast(ignoredIdsLabel(store.unknown));
