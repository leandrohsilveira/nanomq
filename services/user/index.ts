import { MenashAmqpClient, ServiceApp } from "@nanomq/broker"
import { EventProducer } from "domain/shared"
import topology from "domain/topology"
import { UserServiceSubscriber } from "./subscriber"

const amqpClient = new MenashAmqpClient("amqp://broker")
const eventProducer = new EventProducer(amqpClient)
const userServiceSubscriber = new UserServiceSubscriber(eventProducer)
const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [eventProducer],
  subscribers: [userServiceSubscriber],
})

app.start()
