const path = require('path')
/**
 * Module dependencies.
 */

const assert = require('assert')
const fs = require('fs')

/**
 * Reserved word map.
 */

const txt = fs.readFileSync(path.join(__dirname, 'reserved.txt'), 'utf8')
const reserved = txt.split('\n').reduce(function (map, word) {
  map[word.toLowerCase()] = true
  return map
}, {})

/**
 * Expose `format()`.
 */

exports = module.exports = format

/**
 * Format a string.
 *
 * @param {String} fmt
 * @param {Mixed} ...
 * @return {String}
 * @api public
 */

function format (fmt) {
  let i = 1
  const args = arguments
  return fmt.replace(/%([%sILQ])/g, function (_, type) {
    if (type === '%') return '%'

    const arg = args[i++]
    switch (type) {
      case 's': return exports.string(arg)
      case 'I': return exports.ident(arg)
      case 'L': return exports.literal(arg)
      case 'Q': return exports.dollarQuotedString(arg)
    }
  })
}

/**
 * Format as string.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.string = function (val) {
  return val == null ? '' : String(val)
}

/**
 *  Dollar-Quoted String Constants
 */

const randomTags = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'g', 'j', 'k',
  'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't']

/**
 * produces a random number from a given range
 *
 * @param {Number} start start of random numbers range
 * @param {Number} end end of random numbers range (inclusive)
 * @return {Number}
 * @api private
 */

function random (start, end) {
  const range = end - start
  return Math.floor((Math.random() * range) + start)
}

/**
 * Format as dollar quoted string.
 * see: http://www.postgresql.org/docs/8.3/interactive/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.dollarQuotedString = function (val) {
  if (val === undefined || val === null || val === '') return ''
  const randomTag = '$' + randomTags[random(0, randomTags.length)] + '$'
  return randomTag + val + randomTag
}

/**
 * Format as identifier.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.ident = function (val) {
  assert(val != null, 'identifier required')
  return validIdent(val) ? val : quoteIdent(val)
}

/**
 * Format as literal.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

exports.literal = function (val) {
  if (val == null) return 'NULL'
  if (Array.isArray(val)) {
    const vals = val.map(exports.literal)
    return '(' + vals.join(', ') + ')'
  }
  const backslash = ~val.indexOf('\\')
  const prefix = backslash ? 'E' : ''
  val = val.replace(/'/g, "''")
  val = val.replace(/\\/g, '\\\\')
  return prefix + "'" + val + "'"
}

/**
 * Check if `id` is a valid unquoted identifier.
 *
 * @param {String} id
 * @return {Boolean}
 * @api private
 */

function validIdent (id) {
  if (reserved[id]) return false
  return /^[a-z_][a-z0-9_$]*$/.test(id)
}

/**
 * Quote identifier.
 *
 * @param {String} id
 * @return {String}
 * @api private
 */

function quoteIdent (id) {
  id = id.replace(/"/g, '""')
  return '"' + id + '"'
}
