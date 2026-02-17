[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / BodySchema

# Interface: BodySchema

Defined in: [types.ts:343](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L343)

Schema for verifying a function body.

## Extends

- `SequenceMatcher`

## Properties

### $all?

> `optional` **$all**: `string` \| `string`[]

Defined in: [types.ts:317](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L317)

Matches if ALL items in the sequence match the pattern(s).

#### Inherited from

`SequenceMatcher.$all`

***

### $any?

> `optional` **$any**: `string` \| `string`[]

Defined in: [types.ts:315](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L315)

Matches if AT LEAST ONE item in the sequence matches the pattern(s).

#### Inherited from

`SequenceMatcher.$any`

***

### $has?

> `optional` **$has**: `string` \| `string`[]

Defined in: [types.ts:313](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L313)

Unordered "contains" check. Matches if the item(s) exist anywhere in the sequence.
Can be JS snippets or esquery selectors.

#### Inherited from

`SequenceMatcher.$has`

***

### $match?

> `optional` **$match**: `string` \| `string`[]

Defined in: [types.ts:308](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L308)

Ordered matching using JS snippets.
Supports `...` for skipping elements and `_` for single element wildcards.

#### Inherited from

`SequenceMatcher.$match`

***

### $none?

> `optional` **$none**: `string` \| `string`[]

Defined in: [types.ts:319](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L319)

Matches if NO items in the sequence match the pattern(s).

#### Inherited from

`SequenceMatcher.$none`

***

### custom()?

> `optional` **custom**: (`body`) => `boolean`

Defined in: [types.ts:357](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L357)

Custom verification function for the body.

#### Parameters

##### body

[`IBodyInfo`](IBodyInfo.md)

#### Returns

`boolean`

***

### has?

> `optional` **has**: `string` \| `string`[]

Defined in: [types.ts:347](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L347)

CSS-like selector(s) that must exist in the body. (Legacy support)

***

### notHas?

> `optional` **notHas**: `string` \| `string`[]

Defined in: [types.ts:349](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L349)

CSS-like selector(s) that must NOT exist in the body. (Legacy support)

***

### returns?

> `optional` **returns**: `string` \| `SequenceMatcher` \| `string`[] \| (`helper`, `node`, `index`) => `boolean`

Defined in: [types.ts:351](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L351)

Custom validation for return statements.

***

### statementCount?

> `optional` **statementCount**: [`Matcher`](../type-aliases/Matcher.md)\<`number`\>

Defined in: [types.ts:345](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L345)

Matcher for the number of statements in the body.
