import { AmqpMessageStream } from "@mqmicro/broker"
import { EmailSentEvent } from "domain/email"
import {
  UserSignedUpEvent,
  UserSignedUpEmailConfirmationSaga,
} from "domain/user"
import { map, pipe } from "rxjs"
import { SagaService } from "../../service"

export class UserSignedupEmailConfirmationSagaStream extends AmqpMessageStream {
  constructor(private sagaService: SagaService) {
    super()
  }

  operators = [this.beginSaga(), this.finishSaga()]

  protected beginSaga() {
    return pipe(
      this.sagaService.ofMessageMapToSagaCommand(
        UserSignedUpEvent,
        UserSignedUpEmailConfirmationSaga.fromSignedUpEvent,
      ),
      map((saga) => saga.toEmailSendCommand()),
    )
  }

  protected finishSaga() {
    return pipe(this.sagaService.ofMessageMapToFinishSaga(EmailSentEvent))
  }
}
