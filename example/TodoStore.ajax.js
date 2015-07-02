import Immutable from "immutable";
import Kefir from "kefir";
import axios from "axios";
import Keflux from "keflux";

const BASE_URL =  "http://todo-api.dev/todo_items";

function dataFromAjaxResult(result) {
  return Immutable.
    fromJS(result.data.todo_items).
    toOrderedMap().
    mapKeys((key, todo) => todo.get('id'));
}

export default Keflux.Store({

  loadAll(stream) {
    return stream.flatMap(() => {
      return Kefir.fromPromise(axios({
        url: BASE_URL,
        method: "GET",
      })).map((result) => {
        return (data) => dataFromAjaxResult(result);
      });
    });
  },

  create(stream) {
    return stream.
      filter((text) => text.trim().length > 0).
      flatMap((text) => {
        return Kefir.fromPromise(axios({
          url: BASE_URL,
          method: "POST",
          data: {todo_item:{text}},
        })).map((result) => {
          const todo = Immutable.Map(result.data.todo_item);
          return (data) => data.set(todo.get("id"), todo);
        });
      });
  },

  updateText(stream) {
    return stream.
      filter((params) => params.text.trim().length > 0).
      flatMap((params) => {
        return Kefir.fromPromise(axios({
          url: BASE_URL + "/" + params.id,
          method: "PUT",
          data: { todo_item: params },
        })).map((result) => {
          return (data) => data.setIn([params.id, "text"], params.text);
        });
      });
  },

  toggleComplete(stream) {
    return stream.
      flatMap((todo) => {
        return Kefir.fromPromise(axios({
          url: BASE_URL + "/" + todo.id,
          method: "PUT",
          data: { todo_item: { completed: !todo.completed } }
        })).map((result) => {
          return (data) => data.setIn([todo.id, "completed"], !todo.completed);
        });
      });
  },

  destroy(stream) {
    return stream.
      flatMap((todo) => {
        return Kefir.fromPromise(axios({
          url: BASE_URL + "/" + todo.id,
          method: 'DELETE',
        })).map((result) => {
          return (data) => data.remove(todo.id);
        });
      });
  },

  clearCompleted(stream) {
    return stream.flatMap(() => {
      return Kefir.fromPromise(axios({
        url: BASE_URL + "/completed",
        method: "DELETE",
      })).map((result) => {
        return (data) => dataFromAjaxResult(result);
      });
    });
  },

  toggleAll(stream) {
    return stream.flatMap((checked) => {
      const completed = checked ? "true" : "false";
      return Kefir.fromPromise(axios({
        url: BASE_URL + "/toggle_all",
        method: "PUT",
        data: {completed},
      })).map((result) => {
        return (data) => dataFromAjaxResult(result);
      });
    });
  },

});
