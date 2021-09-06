import { ServiceApp } from "@nanomq/api"
import { MenashAmqpClient } from "@nanomq/menash"
import { EventProducer, topology } from "@app/domain"
import { EmailServiceSubscriber } from "./subscriber"

const amqpClient = new MenashAmqpClient(process.env.AMQP)

const eventProducer = new EventProducer(amqpClient)

const emailSubscriber = new EmailServiceSubscriber(eventProducer)

const app = new ServiceApp(amqpClient, {
  config: topology,
  producers: [eventProducer],
  subscribers: [emailSubscriber],
})

app.start()
