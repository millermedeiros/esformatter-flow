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
      'GenericTypeAnnotationClosingChevron': 0,
      'GenericTypeAnnotationOpeningChevron': 0,
      'NullableTypeAnnotationQuestionMark': 1,
      'ReturnTypeColon': 0,
      'TypeAnnotationColon': 0,
      'UnionTypeAnnotationPipe': 1
    },
    'after': {
      'GenericTypeAnnotationClosingChevron': 1,
      'GenericTypeAnnotationOpeningChevron': 0,
      'NullableTypeAnnotationQuestionMark': 0,
      'ReturnTypeColon': 1,
      'TypeAnnotationColon': 1,
      'UnionTypeAnnotationPipe': 1
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
    ws.limit(node.returnType.startToken, 'ReturnTypeColon');
  }
}

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
  // Array<number>
  var typeParameters = node.typeParameters;
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
  node.types.forEach(function(type, i) {
    if (!i) return;
    ws.limit(
      tk.findPrev(type.startToken, '|'),
      'UnionTypeAnnotationPipe'
    );
  });
};
