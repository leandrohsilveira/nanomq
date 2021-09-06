import {
  merge,
  Observable,
  OperatorFunction,
  Subject,
  Subscription,
} from "rxjs"

export type Headers = Record<string, string>

export type MessageStreamOperator = OperatorFunction<
  AmqpInboundMessage,
  AmqpOutboundMessage
>

export class AmqpOutboundMessage<T = any> {
  constructor(
    public readonly key: string,
    public readonly content: T,
    public readonly headers: Headers = {},
  ) {}
}

export abstract class AmqpInboundMessage<
  T = any,
> extends AmqpOutboundMessage<T> {
  abstract ack(): void
  abstract nack(): void
}

export interface AmqpConfig<Config = any> {
  config: Config
  subscribers: Subscriber[]
  producers: Producer[]
}

export interface AmqpClient<Config = any> {
  start(config: AmqpConfig<Config>): Promise<void>

  stop(): Promise<void>

  publish(entity: string, message: AmqpOutboundMessage): Promise<void>

  getBinding(name: string): string
}

export interface Binding {
  name: string
}

export interface Producer {
  publish(message: AmqpOutboundMessage): Promise<void>
}

export interface Subscriber {
  binding: Binding
  onMessage(message: AmqpInboundMessage)
  subscribe(): Subscription
}

export interface MessageStream {
  streams(
    source: Observable<AmqpInboundMessage>,
  ): Observable<AmqpOutboundMessage>[]
}

export abstract class AmqpProducer implements Producer {
  constructor(private amqpClient: AmqpClient, private binding: Binding) {}

  async publish(message: AmqpOutboundMessage) {
    const binding = this.amqpClient.getBinding(this.binding.name)
    console.log(
      `Publishing on "${binding}" message "${
        message.key
      }" with headers: ${JSON.stringify(message.headers)}"`,
    )
    await this.amqpClient.publish(binding, message)
  }
}

export abstract class AmqpSubscriber implements Subscriber {
  constructor(
    public readonly binding: Binding,
    private readonly producer: Producer,
    private readonly streams: MessageStream[],
  ) {
    this.onMessage = this.onMessage.bind(this)
  }

  private streamSubject = new Subject<AmqpInboundMessage>()

  onMessage(message: AmqpInboundMessage) {
    console.log(
      `Message "${message.key}" received with headers: ${JSON.stringify(
        message.headers,
      )}`,
    )
    this.streamSubject.next(message)
    message.ack()
  }

  subscribe(): Subscription {
    return this.configureStreams().subscribe((message) =>
      this.producer.publish(message),
    )
  }

  private configureStreams() {
    const source = this.streamSubject.asObservable()
    return merge(...this.streams.flatMap((stream) => stream.streams(source)))
  }
}

export class ServiceApp<Config = any> {
  constructor(
    private amqp: AmqpClient<Config>,
    private amqpConfig: AmqpConfig<Config>,
  ) {}

  private subscriptions?: Subscription[]

  async start() {
    process.on("SIGTERM", () => this.stop())
    process.on("SIGINT", () => this.stop())
    process.on("exit", () => this.stop())

    await this.amqp.start(this.amqpConfig)
    this.subscriptions = this.amqpConfig.subscribers.map((subscriber) =>
      subscriber.subscribe(),
    )
  }

  private async stop() {
    await this.amqp.stop()
    this.subscriptions?.forEach((subscription) => subscription.unsubscribe())
  }
}

export abstract class AmqpMessageStream implements MessageStream {
  protected abstract operators: MessageStreamOperator[]

  streams(source: Observable<AmqpInboundMessage>) {
    return this.operators.map((operator) => source.pipe(operator))
  }
}
