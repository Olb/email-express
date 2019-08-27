const crypto = require('crypto')

let generatedId = () => crypto.randomBytes(8).toString('hex')

module.exports = generatedId
