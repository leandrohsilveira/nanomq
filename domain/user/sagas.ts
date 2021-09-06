import { Headers } from "broker/amqp"
import { EmailSendCommand } from "../email"
import { fromEvent, SagaMessageEntity } from "../shared"
import { UserSignUpCommand } from "./commands"
import { UserSignedUpEvent } from "./events"
import { UserSignedupModel, UserSignupModel } from "./model"

export class UserSignupSaga extends SagaMessageEntity<UserSignupModel> {
  static readonly key = "sagas.user.signup"

  constructor(content?: UserSignupModel, headers?: Headers) {
    super(UserSignupSaga.key, content, headers)
  }

  toUserSignupCommand() {
    return this.toMessage(UserSignUpCommand)
  }
}

export class UserSignedUpEmailConfirmationSaga extends SagaMessageEntity<UserSignedupModel> {
  static readonly key = "sagas.user.signedup.email.confirmation"

  constructor(content?: UserSignedupModel, headers?: Headers) {
    super(UserSignedUpEmailConfirmationSaga.key, content, headers)
  }

  static fromSignedUpEvent(event: UserSignedUpEvent) {
    return fromEvent(event, UserSignedUpEmailConfirmationSaga)
  }

  toEmailSendCommand() {
    return this.toMessage(EmailSendCommand, {
      template: "user.signup.email.confirmation",
      to: [this.content.email],
      contentProperties: {
        name: this.content.name,
      },
    })
  }
}
