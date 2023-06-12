const {format: prettyFormat} = require('pretty-format');

const val = {object: {}};
val.circularReference = val;
val[Symbol('foo')] = 'foo';
val[Symbol('foo')] = 'foo';
val.map = new Map([['prop', 'value'],['prop1', 'value']]);
val.array = [-0, Infinity, NaN];

console.log(prettyFormat(val));