import { ServiceApp } from "@nanomq/api"
import { MenashAmqpClient } from "@nanomq/menash"
import { EventProducer, topology } from "@app/domain"
import { UserServiceSubscriber } from "./subscriber"

const amqpClient = new MenashAmqpClient(process.env.AMQP)
const eventProducer = new EventProducer(amqpClient)
const userServiceSubscriber = new UserServiceSubscriber(eventProducer)
const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [eventProducer],
  subscribers: [userServiceSubscriber],
})

app.start()
