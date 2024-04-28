import { expect, assert } from 'chai';

import type { Input } from './types/input';
import inputJson from './input.json';
import outputJson from './output.json';
import {
  type EntityStore,
  convertInput,
  validateOutput,
  sortAnnotations,
  sortEntities,
  createEmptyAnnotationStore,
  createEmptyEntityStore,
  processAnnotationsRefs,
  AnnotationStore,
} from './todo';
import {
  validOutputMock,
  invalidOutputMock,
  mockAnnotations,
  mockConvertedAnnotations,
  mockConvertedEntities,
  mockEntities,
} from './__mocks__/output.mock';

describe('the convertInput function', () => {
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

describe('the sorting functions sortEntities and sortAnnotations', () => {
  it('should sort entities by "name" when sortEntities is called', () => {
    mockConvertedEntities.sort(sortEntities);
    expect(mockConvertedEntities.map((e) => e.name)).to.deep.equal(['article', 'article color', 'article total']);
  });

  it('should sort annotations by "index" when sortAnnotations is called', () => {
    const sortedAnnotations = sortAnnotations(mockConvertedAnnotations);
    expect(sortedAnnotations.map((a) => a.index)).to.deep.equal([72, 88, 96]);
  });
});

// BONUS: Write tests that validates the output json. Use the function you have written in "src/todo.ts".
describe('validateOutput function', () => {
  it('should validate successfully for valid output', (done) => {
    validateOutput(validOutputMock)
      .then((result) => {
        assert.isTrue(result);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should throw an error for invalid output', (done) => {
    validateOutput(invalidOutputMock)
      .then((result) => {
        assert.isFalse(result);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe('the convert functions convertEntity and convertAnnotation', () => {
  // TODO: write  tests for the convert functions
});

describe('createEmptyEntityStore function', () => {
  it('should create an entity store with initialized children for each entity', () => {
    const entityStore = createEmptyEntityStore(mockEntities);

    expect(entityStore).to.have.keys(['1', '2']);
    expect(entityStore['1'].children).to.be.an('array').that.is.empty;
    expect(entityStore['2'].children).to.be.an('array').that.is.empty;
  });
});

describe('createEmptyAnnotationStore function', () => {
  it('should create an annotation store and link annotations to entities correctly', () => {
    const entityStore: EntityStore = {
      '1': { id: '1', name: 'Entity1', type: 'REGULAR', class: 'RELATION', children: [] },
      '2': { id: '2', name: 'Entity2', type: 'REGULAR', class: 'RELATION', children: [] },
    };

    const annotationStore = createEmptyAnnotationStore(mockAnnotations, entityStore);

    expect(annotationStore).to.have.keys(['a1', 'a2']);
    expect(annotationStore['a1'].entity.name).to.equal('Entity1');
    expect(annotationStore['a2'].entity.name).to.equal('Entity2');
    expect(annotationStore['a1'].index).to.equal(10);
    expect(annotationStore['a2'].index).to.equal(20);
  });
});

describe('processAnnotationsRefs function', () => {
  it('should process annotations correctly, pushing ones without refs to the output list', () => {
    const annotationStore: AnnotationStore = {
      a1: { id: 'a1', entity: { id: '1', name: 'Entity1' }, value: 'Test1', index: 10, children: [] },
      a2: { id: 'a2', entity: { id: '2', name: 'Entity2' }, value: 'Test2', index: 20, children: [] },
    };

    const processedAnnotations = processAnnotationsRefs(mockAnnotations, annotationStore);

    expect(processedAnnotations).to.be.an('array');
    expect(processedAnnotations.length).to.equal(1);
    expect(processedAnnotations[0].id).to.equal('a1');
  });
});
