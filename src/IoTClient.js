import { Auth, PubSub } from 'aws-amplify';

export class IoTClient {
  wait(time) {
    const prom = {};
    prom.pending = new Promise((...args) => [prom.resolve, prom.reject] = args);
    setTimeout(prom.resolve, time, { time });
    return prom.pending;
  }

  login(name, password) {
    return Auth.signIn(name, password)
    .then(() => this.credentials());
  }

  logout() {
    return Auth.signOut()
    .then(() => this.credentials());
  }

  auth() {
    const user = {};
    [user.name, user.password] = 'jack/abcd1234'.split('/');
    return this.login(user.name, user.password)
    .then(() => this.wait(1000))
    .then(() => this.logout());
  }

  credentials() {
    Auth.currentCredentials().catch(() => ({ identityId: '' }))
    .then(credentials => {
      console.log({ ['[Auth]']: credentials.identityId });
    });
    return Auth.currentAuthenticatedUser().catch(() => ({ username: '' }))
    .then(user => Auth.currentUserCredentials().catch(() => ({ identityId: '' }))
    .then(credentials => ({ user, credentials })))
    .then(({ user, credentials }) => {
      console.log({ identityId: credentials.identityId, name: user.username });
    });
  }

  subscribe(topic, received) {
    console.log('[PubSub]', 'Subscribe', topic);
    PubSub.subscribe(topic, { provider: 'AWSIoTProvider' }).subscribe({
      next: ({ value }) => received(value),
      error: ({ error }) => console.error({ ...error }),
      complete: () => console.log('Done'),
    });
  }

  publish(topic, msg, options) {
    console.log('[PubSub]', 'Publish', topic);
    return PubSub.publish(topic, { msg }, options)
    .catch(error => console.error({ ...error }));
  }
}

const instance = new IoTClient();
instance.IoTClient = IoTClient;
export default instance;
