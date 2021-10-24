import { API } from 'aws-amplify';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { createTodo, deleteTodo } from '../../graphql/mutations';
import { listTodos } from '../../graphql/queries';
import iot from '../../IoTClient';
import ws from '../../background';

export default {
  name: 'App',
  async created() {
    console.log('[Created]', new Date().toISOString());
    iot.subscribe('anonymous/#', ws.received('anonymous/#'));
    iot.subscribe('topic/#', ws.received('topic/#'));
    this.unsubscribeAuth = onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData;
      if (authState === AuthState.SignedIn) this.onSignedIn();
      if (authState === AuthState.SignedOut) this.onSignedOut();
      if (authState === AuthState.SignIn) {
        setTimeout(() => iot.publish('anonymous/hello', `Hello subscribers!`), 2000);
      }
    });
  },
  async mounted() {
    console.log('[Mounted]', new Date().toISOString());
  },
  async beforeUnmount() {
    console.log('[Unmount]', new Date().toISOString());
    this.unsubscribeAuth();
  },
  data() {
    return {
      user: undefined,
      authState: undefined,
      unsubscribeAuth: undefined,
      name: '',
      description: '',
      todos: [],
    };
  },
  methods: {
    async onSignedIn() {
      console.log('[Auth]', "user successfully signed in!");
      setTimeout(() => iot.publish('topic/hello', 'Welcome!'), 2000);
      this.getTodos();
    },
    async onSignedOut() {
      console.log('[Auth]', "user is not signed in...");
      setTimeout(() => iot.publish('topic/bye', 'See you!'), 2000);
    },
    async deleteTodo(id) {
      return API.graphql({
        query: deleteTodo,
        variables: { input: { id } },
      })
      .then(() => this.getTodos())
      .catch(e => console.log(...e.errors));
    },
    async createTodo() {
      const { name, description } = this;
      if (!name || !description) return;
      const todo = { name, description };
      return API.graphql({
        query: createTodo,
        variables: { input: todo },
      })
      .then(() => this.getTodos())
      .then(() => {
        this.name = '';
        this.description = '';
      });
    },
    async getTodos() {
      return API.graphql({
        query: listTodos,
      })
      .then(todos => this.todos = todos.data.listTodos.items)
      .catch(e => console.log(...e.errors));
    },
  },
};
