//jshint node:true, eqnull:true
'use strict';

var defaultsDeep = require('lodash.defaultsdeep');
var indent = require('rocambole-indent');
var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');

var hooks = {};

var defaultOptions = {
  'whiteSpace': {
    'value': ' ',
    'before': {
      'DeclareModuleClosing': 0,
      'DeclareModuleOpening': 1,
      'FunctionTypeAnnotationArrow': 1,
      'FunctionTypeParamColon': 0,
      'FunctionTypeParamsClosing': 0,
      'FunctionTypeParamsComma': 0,
      'FunctionTypeParamsOpening': 0,
      'GenericTypeAnnotationClosingChevron': 0,
      'GenericTypeAnnotationOpeningChevron': 0,
      'ImportFromKeyword': 1,
      'ImportTypeKeyword': 1,
      'ImportSpecifierClosing': 0,
      'ImportSpecifierComma': 0,
      'ImportSpecifierOpening': 1,
      'IntersectionTypeAnnotationOperator': 1,
      'NullableTypeAnnotationQuestionMark': 1,
      'ObjectTypeAnnotationClosing': 0,
      'ObjectTypeAnnotationOpening': 1,
      'ObjectTypePropertyColon': 0,
      'ObjectTypePropertyComma': 0,
      'ObjectTypePropertySemiColon': 0,
      'ReturnTypeColon': 0,
      'TypeAliasOperator': 1,
      'TypeAnnotationColon': 0,
      'UnionTypeAnnotationOperator': 1
    },
    'after': {
      'DeclareModuleClosing': 0,
      'DeclareModuleOpening': 0,
      'FunctionTypeAnnotationArrow': 1,
      'FunctionTypeParamColon': 1,
      'FunctionTypeParamsClosing': 1,
      'FunctionTypeParamsComma': 1,
      'FunctionTypeParamsOpening': 0,
      'GenericTypeAnnotationClosingChevron': 1,
      'GenericTypeAnnotationOpeningChevron': 0,
      'ImportFromKeyword': 1,
      'ImportTypeKeyword': 1,
      'ImportSpecifierClosing': 0,
      'ImportSpecifierComma': 1,
      'ImportSpecifierOpening': 0,
      'IntersectionTypeAnnotationOperator': 1,
      'ObjectTypeAnnotationClosing': 0,
      'ObjectTypeAnnotationOpening': 0,
      'ObjectTypePropertyColon': 1,
      'ObjectTypePropertyComma': 1,
      'ObjectTypePropertySemiColon': 1,
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
  var colon = node.startToken.value === ':' ?
    node.startToken :
    tk.findPrevNonEmpty(node.startToken);
  if (colon.value === ':') {
    ws.limit(colon, 'ReturnTypeColon');
  }
};

hooks.TypeAnnotation = function(node) {
  if (node.startToken.value === ':') {
    ws.limit(node.startToken, 'TypeAnnotationColon');
  }
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

  var opening = node.startToken.value === '(' ?
    node.startToken :
    tk.findNext(node.startToken, '(');
  ws.limit(opening, 'FunctionTypeParamsOpening');

  var endOfLastParam = node.params.length ?
    node.params[node.params.length - 1].endToken :
    opening;

  ws.limit(
    tk.findNext(endOfLastParam, ')'),
    'FunctionTypeParamsClosing'
  );

  var arrow = tk.findInBetween(
    endOfLastParam,
    node.returnType.startToken,
    '=>'
  );
  if (arrow) {
    ws.limit(arrow, 'FunctionTypeAnnotationArrow');
  }
};

hooks.TypeAlias = function(node) {
  ws.limit(
    tk.findNext(node.startToken, '='),
    'TypeAliasOperator'
  );
};

hooks.ObjectTypeAnnotation = function(node) {
  ws.limit(node.startToken, 'ObjectTypeAnnotationOpening');
  ws.limit(node.endToken, 'ObjectTypeAnnotationClosing');
  indentNode(node);
};

hooks.ObjectTypeProperty = function(node) {
  ws.limit(
    tk.findNext(node.startToken, ':'),
    'ObjectTypePropertyColon'
  );

  var prevToken = tk.findPrevNonEmpty(node.startToken);
  if (tk.isComma(prevToken)) {
    ws.limit(prevToken, 'ObjectTypePropertyComma');
  } else if (tk.isSemiColon(prevToken)) {
    ws.limit(prevToken, 'ObjectTypePropertySemiColon');
  }
};

hooks.DeclareModule = function(node) {
  ws.limit(
    node.body.startToken,
    'DeclareModuleOpening'
  );
  ws.limit(
    node.body.endToken,
    'DeclareModuleClosing'
  );
  indentNode(node.body);
};

hooks.ImportDeclaration = function(node) {
  if (node.importKind !== 'type') return;

  var first = node.specifiers[0];
  if (first.type !== 'ImportDefaultSpecifier') {
    var opening = tk.findPrev(first.startToken, '{');
    var closing = tk.findNext(first.endToken, '}');

    node.specifiers.forEach(function(spec) {
      var next = tk.findNextNonEmpty(spec.endToken);
      if (tk.isComma(next)) {
        ws.limit(next, 'ImportSpecifierComma');
      }
    });

    ws.limit(opening, 'ImportSpecifierOpening');
    ws.limit(closing, 'ImportSpecifierClosing');

    indentNode({startToken: opening, endToken: closing});
  }

  ws.limit(
    tk.findNext(node.startToken, 'type'),
    'ImportTypeKeyword'
  );

  ws.limit(
    tk.findPrev(node.endToken, 'from'),
    'ImportFromKeyword'
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

function indentNode(node) {
  indent.inBetween(node.startToken, node.endToken, 1);
}
