import {
  filter,
  from,
  map,
  mapTo,
  MonoTypeOperatorFunction,
  OperatorFunction,
  switchMap,
} from "rxjs"

import { AmqpInboundMessage, AmqpOutboundMessage } from "broker/amqp"
import {
  MessageEntity,
  MessageType,
  ofMessage,
  SagaMessageEntity,
} from "domain/shared"

export type SagaStatus = "started" | "finished"

export type SagaModel = {
  id: string
  name: string
  status: SagaStatus
}

export type SagaMessageMapper<
  I extends MessageEntity<any>,
  O extends MessageEntity<any>,
> = (message: I) => O

export interface SagaService {
  saveSaga(saga: SagaModel): Promise<void>

  ofSagaMessage<C, R extends SagaMessageEntity<C>>(
    sagaType: MessageType<C, R>,
  ): OperatorFunction<AmqpInboundMessage, R>

  ofMessageMapToSagaCommand<
    I,
    MI extends MessageEntity<I>,
    MO extends SagaMessageEntity<any>,
  >(
    eventType: MessageType<I, MI>,
    mapper?: SagaMessageMapper<MI, MO>,
  ): OperatorFunction<AmqpInboundMessage, MO>

  ofMessageMapToFinishSaga(
    eventType: MessageType<any, any>,
  ): OperatorFunction<AmqpInboundMessage, AmqpOutboundMessage>
}

export class SagaServiceImpl implements SagaService {
  ofSagaMessage<C, R extends SagaMessageEntity<C>>(
    sagaType: MessageType<C, R>,
  ): OperatorFunction<AmqpInboundMessage, R> {
    return (source) =>
      source.pipe(ofMessage(sagaType), this.switchMapSaveSaga("started"))
  }

  ofMessageMapToSagaCommand<
    I,
    MI extends MessageEntity<I>,
    MO extends SagaMessageEntity<any>,
  >(
    eventType: MessageType<I, MI>,
    mapper?: SagaMessageMapper<MI, MO>,
  ): OperatorFunction<AmqpInboundMessage, MO> {
    return (source) =>
      source.pipe(
        ofMessage(eventType),
        map(mapper),
        this.switchMapSaveSaga("started"),
      )
  }

  ofMessageMapToFinishSaga(
    eventType: MessageType<any, any>,
  ): OperatorFunction<AmqpInboundMessage, AmqpOutboundMessage> {
    return (source) =>
      source.pipe(
        ofMessage(eventType),
        this.switchMapSaveSaga("finished"),
        filter(() => false),
      )
  }

  async saveSaga(saga: SagaModel) {
    console.log("Saving saga: ", JSON.stringify(saga))
  }

  private switchMapSaveSaga<M extends MessageEntity<any>>(
    status: SagaStatus,
  ): MonoTypeOperatorFunction<M> {
    return (source) =>
      source.pipe(
        switchMap((message) =>
          from(
            this.saveSaga({
              id: message.headers.sagaId,
              name: message.headers.saga,
              status,
            }),
          ).pipe(mapTo(message)),
        ),
      )
  }
}
