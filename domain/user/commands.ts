import { AmqpInboundMessage, Headers } from "broker/amqp"
import { MessageEntity } from "../shared"
import { UserSignedUpEvent } from "./events"
import { UserSignupModel } from "./model"

export class UserSignUpCommand extends MessageEntity<UserSignupModel> {
  static readonly key = "user.signup.command"

  constructor(
    source?: AmqpInboundMessage,
    content?: UserSignupModel,
    headers?: Headers,
  ) {
    super(UserSignUpCommand.key, source, content, headers)
  }

  toSignedUpEvent(id: string) {
    const { name, username, email } = this.content
    return this.toMessage(UserSignedUpEvent, { id, name, username, email })
  }
}
