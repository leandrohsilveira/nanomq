import { AmqpMessageStream } from "@nanomq/api"
import {
  UserSignedUpEvent,
  UserSignedUpEmailConfirmationSaga,
  EmailSentEvent,
} from "@app/domain"
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
