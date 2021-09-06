import { map, pipe, tap } from "rxjs"
import { AmqpMessageStream } from "@nanomq/api"
import { EmailSendCommand, ofMessage } from "@app/domain"

export class EmailUserSignupStream extends AmqpMessageStream {
  operators = [this.handle()]

  handle() {
    return pipe(
      ofMessage(EmailSendCommand),
      tap((msg) =>
        console.log("Sending e-mail to user:", JSON.stringify(msg.content)),
      ),
      map((msg) => msg.toSentEvent()),
    )
  }
}
