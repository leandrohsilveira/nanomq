import { AmqpInboundMessage, Headers } from "broker/amqp"
import { MessageEntity } from "../shared"
import { EmailSentEvent } from "./events"
import { EmailSendModel } from "./model"

export class EmailSendCommand extends MessageEntity<EmailSendModel> {
  static readonly key = "email.send.command"

  constructor(
    source?: AmqpInboundMessage,
    content?: EmailSendModel,
    headers?: Headers,
  ) {
    super(EmailSendCommand.key, source, content, headers)
  }

  toSentEvent() {
    return this.toMessage(EmailSentEvent, { template: this.content.template })
  }
}
