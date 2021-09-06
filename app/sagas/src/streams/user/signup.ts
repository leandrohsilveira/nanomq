import { map, pipe } from "rxjs"
import { SagaService } from "../../service"
import { AmqpMessageStream } from "@nanomq/api"
import { UserSignedUpEvent, UserSignupSaga } from "@app/domain"

export class UserSignupSagaStream extends AmqpMessageStream {
  constructor(private sagaService: SagaService) {
    super()
  }

  operators = [this.beginSaga(), this.finishSaga()]

  protected beginSaga() {
    return pipe(
      this.sagaService.ofSagaMessage(UserSignupSaga),
      map((saga) => saga.toUserSignupCommand()),
    )
  }

  protected finishSaga() {
    return this.sagaService.ofMessageMapToFinishSaga(UserSignedUpEvent)
  }
}
