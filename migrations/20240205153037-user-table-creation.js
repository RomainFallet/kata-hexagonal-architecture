'use strict'

let dbm
let type
let seed
const fs = require('node:fs')
const path = require('node:path')

let Promise

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
  Promise = options.Promise
}

exports.up = function (database) {
  const filePath = path.join(
    __dirname,
    'sqls',
    '20240205153037-user-table-creation-up.sql'
  )
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (error, data) {
      if (error) return reject(error)
      console.log('received data: ' + data)

      resolve(data)
    })
  }).then(function (data) {
    return database.runSql(data)
  })
}

exports.down = function (database) {
  const filePath = path.join(
    __dirname,
    'sqls',
    '20240205153037-user-table-creation-down.sql'
  )
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (error, data) {
      if (error) return reject(error)
      console.log('received data: ' + data)

      resolve(data)
    })
  }).then(function (data) {
    return database.runSql(data)
  })
}

exports._meta = {
  version: 1
}
