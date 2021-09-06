import { AmqpSubscriber, Producer } from "@nanomq/broker"
import { UserServiceSignupStream } from "./stream/signup"

export class UserServiceSubscriber extends AmqpSubscriber {
  constructor(outboundProducer: Producer) {
    super(UserServiceSubscriber, outboundProducer, [
      new UserServiceSignupStream(),
    ])
  }
}
