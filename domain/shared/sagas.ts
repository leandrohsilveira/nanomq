import { AmqpInboundMessage, Headers } from "broker/amqp"
import { createSagaId, MessageEntity, MessageType } from "./events"

export abstract class SagaMessageEntity<T> extends MessageEntity<T> {
  constructor(
    key: string,
    source?: AmqpInboundMessage,
    content?: T,
    headers?: Headers,
  ) {
    super(key, source, content, {
      ...(headers ?? {}),
      saga: key,
      sagaId: createSagaId(key),
    })
  }

  protected toMessage<C, R extends MessageEntity<C>>(
    messageType: MessageType<C, R>,
    content?: C,
    headers?: Headers,
  ): R {
    return new messageType(null, content ?? (this.content as any), {
      ...this.headers,
      ...(headers ?? {}),
      saga: this.headers.saga,
      sagaId: this.headers.sagaId,
    })
  }
}

export function fromEvent<I, O, R extends SagaMessageEntity<O>>(
  event: MessageEntity<I>,
  sagaType: MessageType<O, R>,
  content?: O,
) {
  return new sagaType(null, content ?? (event.content as any))
}
