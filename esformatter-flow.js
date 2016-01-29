//jshint node:true, eqnull:true
'use strict';

var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');

// TODO: support custom options
ws.setOptions({
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
});

exports.nodeAfter = formatNode;
function formatNode(node) {
  if (
    'typeAnnotation' in node &&
    node.typeAnnotation.type === 'TypeAnnotation'
  ) {
    formatTypeAnnotation(node.typeAnnotation);
  } else if ('returnType' in node) {
    formatReturnType(node.returnType);
  }
}

function formatTypeAnnotation(node) {
  ws.limit(node.startToken, 'TypeAnnotationColon');

  var typeAnnotation = node.typeAnnotation;

  switch (typeAnnotation.type) {
    case 'NullableTypeAnnotation':
      // ?number
      ws.limit(
        typeAnnotation.startToken,
        'NullableTypeAnnotationQuestionMark'
      );
      break;

    case 'GenericTypeAnnotation':
      var typeParameters = typeAnnotation.typeParameters;
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
      break;

    case 'UnionTypeAnnotation':
      typeAnnotation.types.forEach((type, i) => {
        if (!i) return;
        ws.limit(
          tk.findPrev(type.startToken, '|'),
          'UnionTypeAnnotationPipe'
        );
      });
      break;
  }
}

function formatReturnType(node) {
  ws.limit(node.startToken, 'ReturnTypeColon');
}
