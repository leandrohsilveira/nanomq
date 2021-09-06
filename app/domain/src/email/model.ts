export type EmailSendModel = {
  template: string
  to: string[]
  cc?: string[]
  cco?: string[]
  contentProperties?: { [key: string]: string }
}

export type EmailSentModel = {
  template: string
}
