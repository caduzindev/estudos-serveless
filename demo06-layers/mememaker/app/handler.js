const { exec } = require('child_process')
const { promisify } = require('util')
const shell = promisify(exec)
const decoratorValidator = require('./util/decoratorValidator')
const globalEnum = require('./util/globalEnum')
const Joi = require('@hapi/joi')
const { get } = require('axios')
const { writeFile, readFile, unlink } = require('fs').promises

class Handler {
  constructor() { }

  static validator() {
    return Joi.object({
      image: Joi.string().uri().required(),
      topText: Joi.string().max(200).required(),
      bottomText: Joi.string().max(200).optional(),
    })
  }

  static async saveImageLocally(imageUrl, imagePath) {
    const { data } = await get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(data, 'base64')
    return writeFile(imagePath, buffer)
  }

  static generateIdentifyCommand(imagePath) {
    const value = `
    gm identify \
    -verbose \
    ${imagePath}
    `

    const cmd = value.split('\n').join(' ')
    return cmd
  }

  static async getImageSize(imagePath) {
    const command = Handler.generateIdentifyCommand(imagePath)
    const { stdout } = await shell(command)
    const [line] = stdout.trim().split('\n').filter(text => ~text.indexOf('Geometry'))
    const [width, height] = line.trim().replace('Geometry: ', "").split("x")

    return {
      width: Number(width),
      height: Number(height)
    }
  }

  static generateImagePath() {
    return `/tmp/${new Date().getTime()}-out.png`
  }

  static setParameters(options, dimensions, imagePath) {
    return {
      topText: options.topText,
      bottomText: options.bottomText || "",
      font: __dirname + './resources/impact.tff',
      fontSize: dimensions.width / 8,
      fontFill: '#FFF',
      textPos: 'center',
      strokeColor: '#000',
      strokeWidth: 1,
      padding: 40,
      imagePath
    }
  }

  static setTextPosition(dimensions, padding) {
    const top = Math.abs((dimensions.height / 2.1) - padding) * -1
    const bottom = (dimensions.height / 2.1) - padding

    return {
      top,
      bottom
    }
  }

  static async generetaConvertCommand(options, finalPath) {
    const value = `
    gm convert
    '${options.imagePath}'
    -font '${options.font}'
    -pointsize '${options.fontSize}'
    -fill '${options.fontFill}'
    -stroke '${options.strokeColor}'
    -strokewidth '${options.strokeWidth}'
    -draw "gravity '${options.textPos}' text 0,'${options.top}' "${options.topText}""
    -draw "gravity center text 0,'${options.bottom}' "${options.bottomText}""
    ${finalPath}
    `

    const final = value.split('\n').join(' ')
    const { stdout } = await shell(final)

    return stdout
  }

  static async generateBase64(imagePath) {
    return readFile(imagePath, "base64")
  }

  static async main(event) {
    try {
      const options = event.queryStringParameters
      const imagePath = Handler.generateImagePath()
      await Handler.saveImageLocally(options.image, imagePath)
      const dimensions = await Handler.getImageSize(imagePath)

      const params = Handler.setParameters(options, dimensions, imagePath)
      const { top, bottom } = Handler.setTextPosition(dimensions, params.padding)
      const finalPath = Handler.generateImagePath()
      await Handler.generetaConvertCommand({
        ...params,
        top,
        bottom
      }, finalPath)

      const imageBuffer = await Handler.generateBase64(finalPath)

      await Promise.all([
        unlink(imagePath),
        unlink(finalPath)
      ])

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: `<img src="data:image/jpeg;base64,${imageBuffer}"/>`
      }
    } catch (error) {
      console.error('error***', error.stack)
      return {
        statusCode: 500,
        body: 'Internal server error!!!'
      }
    }
  }
}
// url: https://2qxkf05kjc.execute-api.us-east-1.amazonaws.com/dev/mememaker?image=https://i.pinimg.com/originals/95/b6/08/95b608b01978840539b8b47e37f846cc.jpg&topText=comia&bottomText=calanguinho
module.exports = { mememaker: decoratorValidator(Handler.main, Handler.validator(), globalEnum.ARG_TYPE.QUERY) }