import { ServiceApp } from "@nanomq/api"
import { MenashAmqpClient } from "@nanomq/menash"
import { SagaProducer, topology } from "@app/domain"
import { GatewayServer } from "./server"

const amqpClient = new MenashAmqpClient(process.env.AMQP)

const sagasProducer = new SagaProducer(amqpClient)

const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [sagasProducer],
  subscribers: [],
})

const server = new GatewayServer(app, sagasProducer)

server.start(Number(process.env.GATEWAY_PORT ?? 8080))
