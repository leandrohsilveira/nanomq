import { ServiceApp } from "@nanomq/api"
import { MenashAmqpClient } from "@nanomq/menash"
import { SagaSubscriber } from "./subscriber"
import { SagaServiceImpl } from "./service"
import { CommandProducer, topology } from "@app/domain"

const amqpClient = new MenashAmqpClient(process.env.AMQP)
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
