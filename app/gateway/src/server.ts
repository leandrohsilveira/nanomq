import * as express from "express"
import { ServiceApp } from "@nanomq/api"
import { UserSignupSaga, SagaProducer } from "@app/domain"

export class GatewayServer {
  constructor(private app: ServiceApp, private sagaProducer: SagaProducer) {}

  async start(port: number) {
    await this.app.start()
    this.startServer(port)
  }

  private configureServer() {
    console.log("[SERVER>CONFIGURE] Configuring server")
    const server = express()
    server.use(express.json())
    // TODO: extract to a router
    server.post("/user/signup", async (req, res) => {
      await this.sagaProducer.publish(new UserSignupSaga(req.body))

      res.sendStatus(200)
    })
    console.log("[SERVER>CONFIGURE] Server configured")
    return server
  }

  private startServer(port: number) {
    const server = this.configureServer()
    console.log("[SERVER>START] Starting server at port", port)
    server.listen(port, () =>
      console.log("[SERVER>START] Started at port", port),
    )
  }
}
