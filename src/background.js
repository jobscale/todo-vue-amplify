import { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import iot from './IoTClient';
import { iot_exports } from './iot-exports';

export class Background {
  constructor() {
    PubSub.addPluggable(new AWSIoTProvider(iot_exports))
    .then(() => iot.credentials());
    return this;
  }

  received(topic) {
    return value => {
      console.log('[Received]', topic, JSON.stringify(value));
    };
  }
}

export default new Background();
