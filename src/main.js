import Amplify from 'aws-amplify';
import {
  applyPolyfills,
  defineCustomElements,
} from '@aws-amplify/ui-components/loader';
import { createApp } from 'vue';
import App from './components/App';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

const app = createApp(App);
app.config.compilerOptions.isCustomElement = tag => {
  return [
    tag.startsWith('amplify-'),
  ].includes(true);
};

applyPolyfills().then(() => {
  defineCustomElements(window);
  app.mount('#app');
});
