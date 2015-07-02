import Kefir from 'kefir';
import Immutable from 'immutable';

class StoreBase {
  constructor(actions, initialData) {
    const handlers = Immutable.OrderedMap(actions);
    const triggers = handlers.map((handler) => new Kefir.Bus());
    this.__streams = handlers.
      map((handler, action) => handler.bind(this)(triggers.get(action)));
    this.actions = triggers.map((trigger) => {
      return (value) => trigger.emit(value);
    }).toJS();
    this.changes = Kefir.
      merge(this.__streams.valueSeq().toJS()).
      scan((prev, fn) => fn(prev), initialData).
      onValue((data) => this.data = data);
  }

  log() {
    this.__streams.forEach((stream, action) => stream.log(action));
    this.changes.map((data) => data.toJS()).log('CHANGES');
  }
}

function Store(actions) {
  class StoreClass extends StoreBase {
    constructor(initialData) {
      super(actions,
            Immutable.fromJS(initialData || {}));
    }
  }
  return StoreClass;
}

export default {Store};
