import { Headers } from "@nanomq/api"
import { MessageEntity } from "../shared"
import { EmailSentModel } from "./model"

export class EmailSentEvent extends MessageEntity<EmailSentModel> {
  static readonly key = "email.sent.event"

  constructor(content?: EmailSentModel, headers?: Headers) {
    super(EmailSentEvent.key, content, headers)
  }
}
