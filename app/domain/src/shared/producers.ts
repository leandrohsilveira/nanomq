import { AmqpClient, AmqpProducer } from "@nanomq/api"

export class SagaProducer extends AmqpProducer {
  constructor(amqp: AmqpClient) {
    super(amqp, SagaProducer)
  }
}

export class EventProducer extends AmqpProducer {
  constructor(amqp: AmqpClient) {
    super(amqp, EventProducer)
  }
}

export class CommandProducer extends AmqpProducer {
  constructor(amqp: AmqpClient) {
    super(amqp, CommandProducer)
  }
}
