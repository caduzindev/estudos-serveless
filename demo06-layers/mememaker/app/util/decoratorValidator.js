const decoratorValidator = (fn, schema, argsType) => {
  return async function (event) {
    const item = argsType === "body" ? "body" : "queryStringParameters"
    const data = event[item]

    const { error, value } = await schema.validate(data, {
      abortEarly: false
    })

    event[argsType] = value

    if (!error) return fn.apply(this, arguments)

    return {
      statusCode: 422,
      error: error.message
    }
  }
}

module.exports = decoratorValidator