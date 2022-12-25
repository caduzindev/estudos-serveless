async function handler(event, context) {
  console.log('Ambiente..', JSON.stringify(process.env, null))
  console.log('Evento..', event, null, 2)

  return {
    opa: 'paulin'
  }
}

module.exports = {
  handler
}