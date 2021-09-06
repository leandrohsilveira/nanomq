import { ConsumerMessage, menash, Topology } from "menashmq"
import {
  AmqpClient,
  AmqpConfig,
  AmqpInboundMessage,
  AmqpOutboundMessage,
  Subscriber,
} from "@nanomq/api"

export type Bindings<T> = T & { $bindings?: string[] }

export interface BoundTopology {
  exchanges?: Bindings<Topology.ExchangeParams>[]
  queues?: Bindings<Topology.QueueParams>[]
  bindings?: Topology.BindingParams[]
  consumers?: Bindings<Omit<Topology.ConsumerParams, "onMessage">>[]
}

export class MenashInboundMessage extends AmqpInboundMessage {
  constructor(public source: ConsumerMessage) {
    super(
      source.fields.routingKey,
      source.getContent(),
      source.properties.headers,
    )
  }

  ack() {
    if (!this.source.acked) this.source.ack()
  }

  nack() {
    if (!this.source.nacked) this.source.nack()
  }
}

export class MenashAmqpClient implements AmqpClient<BoundTopology> {
  constructor(private url: string) {}

  private amqpConfig?: AmqpConfig<BoundTopology>

  async start(amqpConfig: AmqpConfig<BoundTopology>) {
    this.amqpConfig = amqpConfig
    await this.connect()
    await this.configure()
  }

  async stop() {
    console.log("[AMQP>STOP] Stopping AMQP Client")
    await menash.close()
    console.log("[AMQP>STOP] AMQP Client stopped")
  }

  async publish(
    entity: string,
    { content, headers, key }: AmqpOutboundMessage,
  ) {
    await menash.send(entity, content, { headers }, key)
  }

  getBinding(binding: string) {
    const exchanges = this.findBinding(
      binding,
      this.amqpConfig.config.exchanges,
    )
    const queues = this.findBinding(binding, this.amqpConfig.config.queues)
    const consumers = this.findBinding(
      binding,
      this.amqpConfig.config.consumers,
    )

    const count = exchanges.length + queues.length + consumers.length

    if (count === 1)
      return exchanges[0]?.name ?? queues[0]?.name ?? consumers[0]?.queueName
    else if (count === 0)
      throw new Error(`No candidate found for binding "${binding}"`)

    const foundBindings = [
      ...exchanges.map(({ name }) => `Exchange(${name})`),
      ...queues.map(({ name }) => `Queue(${name})`),
      ...consumers.map(({ queueName }) => `Consumer(${queueName})`),
    ].join(", ")

    throw new Error(
      `Multiple candidates found for binding "${binding}": [${foundBindings}]`,
    )
  }

  private async connect() {
    console.log(`[AMQP>CONNECT] Connecting to AMQP of url ${this.url}`)
    await menash.connect(this.url)
    console.log("[AMQP>CONNECT] AMQP Successfully connected")
  }

  private async configure() {
    console.log("[AMQP>CONFIGURE] Configuring AMQP (Menash) Topology")
    await menash.declareTopology({
      ...this.amqpConfig.config,
      consumers: this.amqpConfig.subscribers.flatMap((subscriber) =>
        this.findConsumersForSubscriber(subscriber),
      ),
    })
    console.log("[AMQP>CONFIGURE] AMQP Topology configured")
  }

  private findConsumersForSubscriber(
    subscriber: Subscriber,
  ): Topology.ConsumerParams[] {
    const consumers = this.amqpConfig.config.consumers.filter((consumer) =>
      consumer.$bindings.some((binding) => subscriber.binding.name === binding),
    )
    return consumers.map(({ queueName, options }) => ({
      queueName,
      options,
      onMessage: (message) =>
        subscriber.onMessage(new MenashInboundMessage(message)),
    }))
  }

  private findBinding<T>(name: string, bindings?: Bindings<T>[]) {
    return (bindings ?? []).filter(({ $bindings }) =>
      ($bindings ?? []).some((binding) => binding === name),
    )
  }
}
