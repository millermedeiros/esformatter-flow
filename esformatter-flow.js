//jshint node:true, eqnull:true
'use strict';

var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');

// TODO: support custom options
ws.setOptions({
  'value': ' ',
  'before': {
    'ReturnTypeColon': 0,
    'TypeAnnotationColon': 0,
  },
  'after': {
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
  }
}

function formatReturnType(node) {
  ws.limit(node.startToken, 'ReturnTypeColon');
}
