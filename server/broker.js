import redis from 'redis'

export const CHAT_MESSAGES_TOPIC_NAME = 'chat-messages';

class BrokerClient {
  static build(redisConfig, logger) {
    return new BrokerClient(
      redis.createClient(redisConfig),
      logger
    )
  } 

  constructor(client, logger) {
    this._client = client;
    this._logger = logger;
  }

  async connect() {
    try {
      this._logger.info('Connecting to broker...')
      await this._client.connect();
      this._logger.info('Connected successfully to broker...')
    } catch (err) {
      this._logger.error('Failed to connect to broker...')
      throw err
    }
  }

  async disconnect() {
   try {
      this._logger.info('Disconnecting from broker...')
      await this._client.disconnect();
      this._logger.info('Disconnected successfully from broker...')
    } catch (err) {
      this._logger.error('Failed to disconnect from broker...')
      throw err
    }
  }
  
  async publish(topicName, message) {
    return this._client.publish(topicName, message);
  }

  async subscribe(topic, callback) {
    return this._client.subscribe(topic, callback);
  }
}

export default class MessageBroker {
  static build(redisConfig, logger) {
    return new MessageBroker(
      BrokerClient.build(redisConfig, logger),
      BrokerClient.build(redisConfig, logger),
      logger
    )
  } 

  constructor(publisher, subscriber, logger) {
    this._publisher = publisher;
    this._subscriber = subscriber;
    this._logger = logger;
  }

  async publish(topicName, messageObject) {
    try {
      await this._publisher.connect();
      await this._publisher.publish(topicName, JSON.stringify(messageObject));
    } catch (err) {
      this._logger.error('Failed to publish message to broker...')
      throw err
    } finally {
      await this._publisher.disconnect();
    }
  }

  async listen(topic, callback) {
    try {
      await this._subscriber.connect();
      return await this._subscriber.subscribe(topic, callback);
    } catch (err) {
      this._logger.error('Failed to receive message from broker...')
      throw err
    }
  }
}