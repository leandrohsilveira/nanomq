import { Headers } from "@nanomq/broker"
import { MessageEntity } from "../shared"
import { EmailSentEvent } from "./events"
import { EmailSendModel } from "./model"

export class EmailSendCommand extends MessageEntity<EmailSendModel> {
  static readonly key = "email.send.command"

  constructor(content?: EmailSendModel, headers?: Headers) {
    super(EmailSendCommand.key, content, headers)
  }

  toSentEvent() {
    return this.toMessage(EmailSentEvent, { template: this.content.template })
  }
}
