import { AmqpInboundMessage, Headers } from "@nanomq/api"
import { v4 } from "uuid"

export interface MessageType<T, R extends MessageEntity<T>> {
  new (content?: T, headers?: Headers): R
  key: string
}

export function createSagaId(saga: string) {
  return `${saga}#${v4()}`
}

export abstract class MessageEntity<T> extends AmqpInboundMessage<T> {
  constructor(key: string, content?: T, headers?: Headers) {
    super(key, content, headers ?? {})
  }

  source?: AmqpInboundMessage<T>

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
    return new messageType(content ?? (this.content as any), {
      ...this.headers,
      ...(headers ?? {}),
    })
  }
}

export function fromSource<C, R extends MessageEntity<C>>(
  source: AmqpInboundMessage,
  messageType: MessageType<C, R>,
) {
  const message = new messageType(source.content, source.headers)
  message.source = source
  return message
}
