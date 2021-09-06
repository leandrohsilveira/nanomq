import { MenashAmqpClient, ServiceApp } from "@nanomq/broker"
import { SagaProducer } from "domain/shared"
import topology from "domain/topology"
import { GatewayServer } from "./server"

const amqpClient = new MenashAmqpClient("amqp://broker")

const sagasProducer = new SagaProducer(amqpClient)

const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [sagasProducer],
  subscribers: [],
})

const server = new GatewayServer(app, sagasProducer)

server.start()
