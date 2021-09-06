import { Headers } from "@nanomq/broker"
import { MessageEntity } from "../shared"
import { UserSignedUpEvent } from "./events"
import { UserSignupModel } from "./model"

export class UserSignUpCommand extends MessageEntity<UserSignupModel> {
  static readonly key = "user.signup.command"

  constructor(content?: UserSignupModel, headers?: Headers) {
    super(UserSignUpCommand.key, content, headers)
  }

  toSignedUpEvent(id: string) {
    const { name, username, email } = this.content
    return this.toMessage(UserSignedUpEvent, { id, name, username, email })
  }
}
