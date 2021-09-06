import { MenashAmqpClient, ServiceApp } from "@nanomq/broker"
import { EventProducer } from "domain/shared"
import topology from "domain/topology"
import { EmailServiceSubscriber } from "./subscriber"

const amqpClient = new MenashAmqpClient("amqp://broker")

const eventProducer = new EventProducer(amqpClient)

const emailSubscriber = new EmailServiceSubscriber(eventProducer)

const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [eventProducer],
  subscribers: [emailSubscriber],
})

app.start()
