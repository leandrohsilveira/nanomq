import { AmqpInboundMessage } from "broker/amqp"
import {
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  switchMap,
  tap,
} from "rxjs"
import { fromSource } from "."
import { MessageEntity, MessageType } from "./events"

export type ServiceOutput<M extends MessageEntity<any>, O> = {
  message: M
  output: O
}

function fromConsumerMessage<C, R extends MessageEntity<C>>(
  message: AmqpInboundMessage,
  messageType: MessageType<C, R>,
) {
  if (message.key === messageType.key) return fromSource(message, messageType)
  throw new Error(
    `Consumer's message routingKey "${message.key}" is not assignable to type ${messageType} of key "${messageType.key}"`,
  )
}

export function ack(): MonoTypeOperatorFunction<AmqpInboundMessage> {
  return (source) => source.pipe(tap((message) => message.ack()))
}

export function nack(): MonoTypeOperatorFunction<AmqpInboundMessage> {
  return (source) => source.pipe(tap((message) => message.nack()))
}

export function ofMessage<C, R extends MessageEntity<C>>(
  inbound: MessageType<C, R>,
  ackOrNack: typeof ack | typeof nack = ack,
): OperatorFunction<AmqpInboundMessage, R> {
  return (source) =>
    source.pipe(
      filter((message) => message.key === inbound.key),
      ackOrNack(),
      map((message) => fromConsumerMessage(message, inbound)),
    )
}

export function service<
  SO,
  MI extends MessageEntity<any>,
  MO extends MessageEntity<any>,
>(
  serviceOperator: (msg: MI) => Observable<SO>,
  mapper: (output: ServiceOutput<MI, SO>) => MO,
): OperatorFunction<MI, MO> {
  return (source) =>
    source.pipe(
      switchMap((message) =>
        serviceOperator(message).pipe(map((output) => ({ message, output }))),
      ),
      map(mapper),
    )
}
