import { expect } from 'chai';

import type { Input } from './types/input';
import inputJson from './input.json';
import outputJson from './output.json';
import { convertInput, sortAnnotations, sortEntities, validateOutput } from './todo';
import {
  // validOutputMock,
  // invalidOutputMock,
  mockAnnotations,
  mockEntities,
  validOutput,
  invalidOutput,
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
    mockEntities.sort(sortEntities);
    expect(mockEntities.map((e) => e.name)).to.deep.equal(['article', 'article color', 'article total']);
  });

  it('should sort annotations by "index" when sortAnnotations is called', () => {
    mockAnnotations.sort(sortAnnotations);
    expect(mockAnnotations.map((a) => a.index)).to.deep.equal([72, 88, 96]);
  });
});

// BONUS: Write tests that validates the output json. Use the function you have written in "src/todo.ts".
// describe('validateOutput function', () => {
//   it('should validate successfully for valid output', (done) => {
//     validateOutput(validOutputMock)
//       .then((result) => {
//         assert.isTrue(result);
//         done();
//       })
//       .catch((err) => {
//         done(err);
//       });
//   });

//   it('should throw an error for invalid output', (done) => {
//     validateOutput(invalidOutputMock)
//       .then((result) => {
//         assert.isFalse(result);
//         done();
//       })
//       .catch((err) => {
//         done(err);
//       });
//   });
// });

// describe('the convert functions convertEntity and convertAnnotation', () => {
//   // TODO: write  tests for the convert functions
// });

describe('validateOutput function', () => {
  it('should return true for valid output', () => {
    const result = validateOutput(validOutput);
    expect(result).to.be.true;
  });

  it('should return false for invalid output', () => {
    const result = validateOutput(invalidOutput);
    expect(result).to.be.false;
  });
});

// describe('validateOutput2', () => {
//   it('should validate correct output successfully', async () => {
//     await expect(validateOutput2(validOutput)).resolves.toBeUndefined();
//   });

//   it('should throw an error for incorrect output', async () => {
//     await expect(validateOutput2(invalidOutput)).rejects.toThrow();
//   });
// });
