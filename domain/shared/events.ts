import { AmqpInboundMessage, Headers } from "broker/amqp"
import { v4 } from "uuid"

export interface MessageType<T, R> {
  new (source?: AmqpInboundMessage, content?: T, headers?: Headers): R
  key: string
}

export function createSagaId(saga: string) {
  return `${saga}#${v4()}`
}

export abstract class MessageEntity<T> extends AmqpInboundMessage<T> {
  constructor(
    key: string,
    public source?: AmqpInboundMessage<T>,
    content?: T,
    headers?: Headers,
  ) {
    super(key, content ?? source?.content, headers ?? source?.headers ?? {})
    this.validateSourceMessage()
  }

  ack() {
    if (this.source) this.source.ack()
    throw new Error(`No source message from queue to ack. Message: ${this.key}`)
  }

  nack() {
    if (this.source) this.source.nack()
    throw new Error(
      `No source message from queue to nack. Message: ${this.key}`,
    )
  }

  protected toMessage<C, R extends MessageEntity<C>>(
    messageType: MessageType<C, R>,
    content?: C,
    headers?: Headers,
  ): R {
    return new messageType(null, content ?? (this.content as any), {
      ...this.headers,
      ...(headers ?? {}),
    })
  }

  private validateSourceMessage() {
    if (this.source && this.source.key !== this.key)
      throw new Error(
        `Source message key "${this.source.key}" diverges from entity message key "${this.key}"`,
      )
  }
}
