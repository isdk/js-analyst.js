[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / offsetToLineColumn

# Function: offsetToLineColumn()

> **offsetToLineColumn**(`source`, `offset`): `object`

Defined in: [utils/source.ts:175](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/utils/source.ts#L175)

Converts a character offset to line and column numbers.

## Parameters

### source

`string`

The original source code string.

### offset

`number`

The 0-based character offset.

## Returns

`object`

An object containing the 1-based line and 0-based column.

### column

> **column**: `number`

### line

> **line**: `number`
