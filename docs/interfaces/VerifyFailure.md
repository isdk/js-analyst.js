[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / VerifyFailure

# Interface: VerifyFailure

Defined in: [types.ts:400](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L400)

Details of a verification failure.

## Properties

### actual?

> `optional` **actual**: `unknown`

Defined in: [types.ts:406](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L406)

The actual value found.

***

### expected?

> `optional` **expected**: `unknown`

Defined in: [types.ts:404](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L404)

The expected value or matcher description.

***

### message

> **message**: `string`

Defined in: [types.ts:408](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L408)

A human-readable error message.

***

### path

> **path**: `string`

Defined in: [types.ts:402](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L402)

The JSON path to the failed property.
