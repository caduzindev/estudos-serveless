const uuid = require('uuid')
const Joi = require('@hapi/joi')
const decoratorValidator = require('./util/decoratorValidator')
const globalEnum = require('./util/globalEnum')

class Handler {
  constructor({ dynamodbSvc }) {
    this.dynamodbSvc = dynamodbSvc
    this.dynamodbTable = process.env.DYNAMORDB_TABLE
  }
  static validator() {
    return Joi.object({
      nome: Joi.string().max(100).min(2).required(),
      poder: Joi.string().max(20).required()
    })
  }
  async insertData(params) {
    return this.dynamodbSvc.put(params).promise()
  }
  prepareData(data) {
    const params = {
      TableName: this.dynamodbTable,
      Item: {
        ...data,
        id: uuid.v4(),
        createdAt: new Date().toISOString()
      }
    }

    return params
  }
  handleSucess(data) {
    return {
      statusCode: data.statusCode,
      body: data.data
    }
  }

  handleError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn`t create Item!'
    }
  }
  async main(event) {
    try {
      const dbParams = this.prepareData(event.body)
      await this.insertData(dbParams)
      return this.handleSucess({
        statusCode: 201,
        data: dbParams.Item
      })

    } catch (error) {
      console.error(error.stack)
      return this.handleError({ statusCode: 500 })
    }
  }
}

const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({
  dynamodbSvc: dynamodb
})

module.exports = decoratorValidator(
  handler.main.bind(handler),
  Handler.validator(),
  globalEnum.ARG_TYPE.BODY
)