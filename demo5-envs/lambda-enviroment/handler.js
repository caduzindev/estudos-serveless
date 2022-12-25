const settings = require('./config/settings')
const axios = require('axios')
const cheerio = require('cheerio');
const uuid = require('uuid')
const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()

class Handler {
  static async main(event) {
    console.log('at', new Date().toISOString(), JSON.stringify(event, null, 2))

    const { data } = await axios.get(settings.commitMessageUrl)
    const $ = cheerio.load(data)

    const commitMessage = $('#content p:first-child').text()
    const params = {
      TableName: settings.dbTableName,
      Item: {
        commitMessage,
        id: uuid.v4(),
        createdAt: new Date().toISOString()
      }
    }

    await dynamoDB.put(params).promise()

    return {
      statusCode: 200
    }
  }
}

module.exports = {
  scheduler: Handler.main
}