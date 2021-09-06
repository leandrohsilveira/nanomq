import { Headers } from "@nanomq/broker"
import { createSagaId, MessageEntity, MessageType } from "./events"

export abstract class SagaMessageEntity<T> extends MessageEntity<T> {
  constructor(key: string, content?: T, headers?: Headers) {
    super(key, content, {
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
    return new messageType(content ?? (this.content as any), {
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
  return new sagaType(content ?? (event.content as any))
}
