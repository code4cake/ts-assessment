import { expect } from 'chai';
import inputJson from './input.json';
import outputJson from './output.json';
import { convertInput, sortAnnotations, sortEntities } from './todo';

import { Input, EntityClass, EntityType } from './types/input';

describe.only('convertInput function', () => {
  it('should have the right entities length after conversion', () => {
    const output = convertInput(inputJson as Input);
    expect(output.documents[0].entities.length).to.equal(14);
  });

  it('should have the right annotations length after conversion', () => {
    const output = convertInput(inputJson as Input);
    expect(output.documents[0].annotations.length).to.equal(9);
  });

  // TODO: make sure this test passes
  it('should be able to convert the input (flat lists) to the output (nested) structure', () => {
    const output = convertInput(inputJson as Input);
    expect(output.documents.length).to.equal(1);

    expect(output).to.deep.equal(outputJson);
  });
});

describe('sorting functions', () => {
  const mockEntities = [
    { id: '1', name: 'article total', type: EntityType.NUMBER, class: EntityClass.TEXT, children: [] },
    { id: '2', name: 'article color', type: EntityType.REGULAR, class: EntityClass.TEXT, children: [] },
    { id: '3', name: 'article', type: EntityType.REGULAR, class: EntityClass.RELATION, children: [] },
  ];

  const mockAnnotations = [
    { id: 'a1', entity: { id: '1', name: 'article total' }, value: 394.68, index: 88, children: [] },
    { id: 'a2', entity: { id: '2', name: 'article color' }, value: 'White', index: 96, children: [] },
    { id: 'a3', entity: { id: '3', name: 'article' }, value: null, index: 72, children: [] },
  ];

  it('should sortEntities by "name"', () => {
    mockEntities.sort(sortEntities);
    expect(mockEntities.map((e) => e.name)).to.deep.equal(['article', 'article color', 'article total']);
  });

  it('should sortAnnotations by index', () => {
    mockAnnotations.sort(sortAnnotations);
    expect(mockAnnotations.map((a) => a.index)).to.deep.equal([72, 88, 96]);
  });
});

describe('convertEntity function', () => {});
describe('convertAnnotation function', () => {});
describe('validateOutput function', () => {
  // BONUS: Write tests that validates the output json. Use the function you have written in "src/todo.ts".
});
