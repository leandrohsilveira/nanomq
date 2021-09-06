import { AmqpMessageStream } from "@nanomq/broker"
import { ofMessage, service } from "domain/shared"
import { UserSignUpCommand } from "domain/user"
import { of, pipe } from "rxjs"
import { v4 } from "uuid"

export class UserServiceSignupStream extends AmqpMessageStream {
  operators = [this.handle()]

  handle() {
    return pipe(
      ofMessage(UserSignUpCommand),
      service(
        (msg) => {
          console.log("Persisting user", JSON.stringify(msg.content))
          return of({ id: v4() })
        },
        ({ message, output }) => message.toSignedUpEvent(output.id),
      ),
    )
  }
}
