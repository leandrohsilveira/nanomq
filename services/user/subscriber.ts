import { AmqpSubscriber, Producer } from "broker/amqp"
import { UserServiceSignupStream } from "./stream/signup"

export class UserServiceSubscriber extends AmqpSubscriber {
  constructor(outboundProducer: Producer) {
    super(UserServiceSubscriber, outboundProducer, [
      new UserServiceSignupStream(),
    ])
  }
}
