//jshint node:true, eqnull:true
'use strict';

var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');

// TODO: support custom options
ws.setOptions({
  'value': ' ',
  'before': {
    'NullableTypeAnnotationQuestionMark': 1,
    'ReturnTypeColon': 0,
    'TypeAnnotationColon': 0,
  },
  'after': {
    'NullableTypeAnnotationQuestionMark': 0,
    'ReturnTypeColon': 1,
    'TypeAnnotationColon': 1,
  }
});

exports.nodeAfter = formatNode;
function formatNode(node) {
  if ('typeAnnotation' in node) {
    formatTypeAnnotation(node.typeAnnotation);
  } else if ('returnType' in node) {
    formatReturnType(node.returnType);
  }
}

function formatTypeAnnotation(node) {
  if (node.type === 'TypeAnnotation') {
    ws.limit(node.startToken, 'TypeAnnotationColon');

    if (node.typeAnnotation.type === 'NullableTypeAnnotation') {
      ws.limit(
        node.typeAnnotation.startToken,
        'NullableTypeAnnotationQuestionMark'
      );
    }
  }
}

function formatReturnType(node) {
  ws.limit(node.startToken, 'ReturnTypeColon');
}
