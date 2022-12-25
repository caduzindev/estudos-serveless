class Handler {
  async main(event) {
    const [{ body, messageId }] = event.Records
    const item = JSON.parse(body)
    console.log(JSON.stringify(
      {
        ...item,
        messageId,
        at: new Date().toISOString()
      }, null, 2))
    try {
      return {
        statusCode: 200,
        body: 'Hello'
      }
    } catch (error) {
      console.error('error', error)
      return {
        statusCode: 500,
        body: 'Internal server error'
      }
    }
  }
}

const handler = new Handler()
module.exports = handler.main.bind(handler)