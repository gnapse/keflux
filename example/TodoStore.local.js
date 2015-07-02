import Immutable from "immutable";
import Kefir from "kefir";
import uuid from "node-uuid";
import Keflux from "keflux";

function _set(data) {
  const str = JSON.stringify(data.toJS());
  window.localStorage['todo-items'] = str;
  return data;
}

function _get() {
  const data = window.localStorage['todo-items'] || '{}';
  return Immutable.fromJS(JSON.parse(data));
}

export default Keflux.Store({

  loadAll(stream) {
    return stream.map(() => {
      return (data) => _get();
    });
  },

  create(stream) {
    return stream.
      filter((text) => text.trim().length > 0).
      map((text) => {
        const todo = Immutable.OrderedMap({
          id: uuid.v1(),
          text: text,
          completed: false,
        });
        return (data) => _set(data.set(todo.get("id"), todo));
      });
  },

  updateText(stream) {
    return stream.
      filter((params) => params.text.trim().length > 0).
      map((params) => {
        return (data) => _set(data.setIn([params.id, "text"], params.text));
      });
  },

  toggleComplete(stream) {
    return stream.map((todo) => {
      return (data) => _set(data.setIn([todo.id, "completed"], !todo.completed));
    });
  },

  destroy(stream) {
    return stream.map((todo) => {
      return (data) => _set(data.remove(todo.id));
    });
  },

  clearCompleted(stream) {
    return stream.map(() => {
      return (data) => _set(data.filter((todo) => !todo.get('completed')));
    });
  },

  toggleAll(stream) {
    return stream.map((checked) => {
      return (data) => _set(data.map((todo) => todo.set('completed', checked)));
    });
  },

});
