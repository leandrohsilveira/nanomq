import { AmqpSubscriber, Producer } from "@nanomq/api"
import { EmailUserSignupStream } from "./stream/user-signup"

export class EmailServiceSubscriber extends AmqpSubscriber {
  constructor(producer: Producer) {
    super(EmailServiceSubscriber, producer, [new EmailUserSignupStream()])
  }
}
