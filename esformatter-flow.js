//jshint node:true, eqnull:true
'use strict';

var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');
var defaultsDeep = require('lodash.defaultsdeep');

var hooks = {};

var defaultOptions = {
  'whiteSpace': {
    'value': ' ',
    'before': {
      'FunctionTypeAnnotationArrow': 1,
      'FunctionTypeParamColon': 0,
      'FunctionTypeParamsClosing': 0,
      'FunctionTypeParamsComma': 0,
      'FunctionTypeParamsOpening': 0,
      'GenericTypeAnnotationClosingChevron': 0,
      'GenericTypeAnnotationOpeningChevron': 0,
      'IntersectionTypeAnnotationOperator': 1,
      'NullableTypeAnnotationQuestionMark': 1,
      'ReturnTypeColon': 0,
      'TypeAliasOperator': 1,
      'TypeAnnotationColon': 0,
      'UnionTypeAnnotationOperator': 1
    },
    'after': {
      'FunctionTypeAnnotationArrow': 1,
      'FunctionTypeParamColon': 1,
      'FunctionTypeParamsClosing': 1,
      'FunctionTypeParamsComma': 1,
      'FunctionTypeParamsOpening': 0,
      'GenericTypeAnnotationClosingChevron': 1,
      'GenericTypeAnnotationOpeningChevron': 0,
      'IntersectionTypeAnnotationOperator': 1,
      'NullableTypeAnnotationQuestionMark': 0,
      'ReturnTypeColon': 1,
      'TypeAliasOperator': 1,
      'TypeAnnotationColon': 1,
      'UnionTypeAnnotationOperator': 1
    }
  }
};

exports.setOptions = setOptions;
function setOptions(opts) {
  var options = defaultsDeep({}, opts.flow, defaultOptions);
  ws.setOptions(options.whiteSpace);
}

exports.nodeAfter = formatNode;
function formatNode(node) {
  if (node.type in hooks) {
    hooks[node.type](node);
  }

  if ('returnType' in node) {
    hooks.returnType(node.returnType);
  }
}

hooks.returnType = function(node) {
  if (node.startToken.value === ':') {
    ws.limit(node.startToken, 'ReturnTypeColon');
  }
};

hooks.TypeAnnotation = function(node) {
  ws.limit(node.startToken, 'TypeAnnotationColon');
};

hooks.NullableTypeAnnotation = function(node) {
  // ?number
  ws.limit(
    node.startToken,
    'NullableTypeAnnotationQuestionMark'
  );
};

hooks.GenericTypeAnnotation = function(node) {
  // Foo
  var typeParameters = node.typeParameters;
  if (!typeParameters) return;

  // Array<number>
  ws.limit(
    typeParameters.startToken,
    'GenericTypeAnnotationOpeningChevron'
  );
  // TODO: handle multiple typeParameters.params
  ws.limit(
    typeParameters.endToken,
    'GenericTypeAnnotationClosingChevron'
  );
};

hooks.UnionTypeAnnotation = function(node) {
  // Foo | Bar
  node.types.forEach(function(type, i) {
    if (!i) return;
    ws.limit(
      tk.findPrev(type.startToken, '|'),
      'UnionTypeAnnotationOperator'
    );
  });
};

hooks.IntersectionTypeAnnotation = function(node) {
  // Foo & Bar
  node.types.forEach(function(type, i) {
    if (!i) return;
    ws.limit(
      tk.findPrev(type.startToken, '&'),
      'IntersectionTypeAnnotationOperator'
    );
  });
};

hooks.FunctionTypeParam = function(node) {
  ws.limit(
    tk.findNext(node.startToken, ':'),
    'FunctionTypeParamColon'
  );

  var prevToken = tk.findPrevNonEmpty(node.startToken);
  if (tk.isComma(prevToken)) {
    ws.limit(prevToken, 'FunctionTypeParamsComma');
  }
};

hooks.FunctionTypeAnnotation = function(node) {
  handleSurroundingParenthesis(node);

  ws.limit(
    node.startToken,
    'FunctionTypeParamsOpening'
  );

  var endOfLastParam = node.params.length ?
    node.params[node.params.length - 1].endToken :
    node.startToken;

  ws.limit(
    tk.findNext(endOfLastParam, ')'),
    'FunctionTypeParamsClosing'
  );

  ws.limit(
    tk.findNext(endOfLastParam, '=>'),
    'FunctionTypeAnnotationArrow'
  );
};

hooks.TypeAlias = function(node) {
  ws.limit(
    tk.findNext(node.startToken, '='),
    'TypeAliasOperator'
  );
};

function handleSurroundingParenthesis(node) {
  var prev = tk.findPrevNonEmpty(node.startToken);
  var next = tk.findNextNonEmpty(node.endToken);
  if (prev.value === '(' && next.value === ')') {
    ws.limit(prev, 0);
    ws.limit(next, 0);
  }
}
