import { MenashAmqpClient, ServiceApp } from "@nanomq/broker"
import { SagaSubscriber } from "./subscriber"
import { SagaServiceImpl } from "./service"
import { CommandProducer } from "domain/shared"
import topology from "domain/topology"

const amqpClient = new MenashAmqpClient("amqp://broker")
const commandsProducer = new CommandProducer(amqpClient)
const sagasSubscriber = new SagaSubscriber(
  commandsProducer,
  new SagaServiceImpl(),
)
const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [commandsProducer],
  subscribers: [sagasSubscriber],
})

app.start()
