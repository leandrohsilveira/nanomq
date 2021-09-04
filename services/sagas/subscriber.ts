import { AmqpSubscriber, Producer } from "broker/amqp"
import { SagaService } from "./service"
import {
  UserSignupSagaStream,
  UserSignedupEmailConfirmationSagaStream,
} from "./streams/user"

export class SagaSubscriber extends AmqpSubscriber {
  constructor(producer: Producer, sagaService: SagaService) {
    super(SagaSubscriber, producer, [
      new UserSignupSagaStream(sagaService),
      new UserSignedupEmailConfirmationSagaStream(sagaService),
    ])
  }
}
