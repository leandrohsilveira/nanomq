import { AmqpInboundMessage, Headers } from "broker/amqp"
import { MessageEntity } from "../shared"
import { EmailSentModel } from "./model"

export class EmailSentEvent extends MessageEntity<EmailSentModel> {
  static readonly key = "email.sent.event"

  constructor(
    source?: AmqpInboundMessage,
    content?: EmailSentModel,
    headers?: Headers,
  ) {
    super(EmailSentEvent.key, source, content, headers)
  }
}
