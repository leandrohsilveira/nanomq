import { AmqpInboundMessage, Headers } from "broker/amqp"
import { MessageEntity } from "../shared"
import { UserSignedupModel } from "./model"

export class UserSignedUpEvent extends MessageEntity<UserSignedupModel> {
  static readonly key = "user.signedup.event"

  constructor(
    source?: AmqpInboundMessage,
    content?: UserSignedupModel,
    headers?: Headers,
  ) {
    super(UserSignedUpEvent.key, source, content, headers)
  }
}
