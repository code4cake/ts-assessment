import { Annotation, Entity, ENTITY_CLASS, ENTITY_TYPE } from '../types/input';
import type { ConvertedAnnotation, ConvertedEntity, Output } from '../types/output';

export const mockConvertedEntities: ConvertedEntity[] = [
  { id: '1', name: 'article total', type: ENTITY_TYPE.NUMBER, class: ENTITY_CLASS.TEXT, children: [] },
  { id: '2', name: 'article color', type: ENTITY_TYPE.REGULAR, class: ENTITY_CLASS.TEXT, children: [] },
  { id: '3', name: 'article', type: ENTITY_TYPE.REGULAR, class: ENTITY_CLASS.RELATION, children: [] },
];

export const mockConvertedAnnotations: ConvertedAnnotation[] = [
  { id: 'a1', entity: { id: '1', name: 'article total' }, value: 394.68, index: 88, children: [] },
  { id: 'a2', entity: { id: '2', name: 'article color' }, value: 'White', index: 96, children: [] },
  { id: 'a3', entity: { id: '3', name: 'article' }, value: null, index: 72, children: [] },
];

export const mockAnnotations = [
  { id: 'a1', entityId: '1', refs: [], value: 'Test1', indices: [{ start: 10 }] },
  { id: 'a2', entityId: '2', refs: ['a1'], value: 'Test2', indices: [{ start: 20 }] },
] as unknown as Annotation[];

export const mockEntities = [
  { id: '1', name: 'Entity1', type: 'REGULAR', class: 'RELATION' },
  { id: '2', name: 'Entity2', type: 'REGULAR', class: 'RELATION' },
] as unknown as Entity[];

export const validOutputMock: Output = {
  documents: [
    {
      id: '65afd249bd19b2cdb0eff56d',
      entities: [
        {
          id: '65afd45bdb285265fae6ca90',
          name: 'article',
          type: 'REGULAR',
          class: 'RELATION',
          children: [
            {
              id: '65afd42fdb285265fae6ca62',
              name: 'article details',
              type: 'REGULAR',
              class: 'RELATION',
              children: [
                {
                  id: '65afd3a8db285265fae6c945',
                  name: 'article color',
                  type: 'REGULAR',
                  class: 'TEXT',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
      annotations: [
        {
          id: '65afd64a45977d96c2ebc9fc',
          entity: {
            id: '65afd280db285265fae6c728',
            name: 'invoice number',
          },
          value: 'INV 20277107',
          index: 55,
          children: [],
        },
      ],
    },
  ],
};

export const invalidOutputMock = {
  documents: [
    {
      id: '', // Invalid as 'id' should not be empty
      entities: [
        {
          id: '65afd45bdb285265fae6ca90',
          name: 'article',
          type: 'INVALID_TYPE', // Invalid type
          class: 'RELATION',
          children: [
            {
              id: '65afd42fdb285265fae6ca62',
              name: 'article details',
              type: '', // Invalid type
              class: '', // Invalid class
              children: [
                {
                  id: '65afd3a8db285265fae6c945',
                  name: 'article color',
                  type: 'REGULAR',
                  class: 'TEXT',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
      annotations: [
        {
          id: '', // missing id
          entity: {
            id: '65afd280db285265fae6c728',
            name: 'invoice number',
          },
          value: 'INV 20277107',
          index: 55,
          children: [],
        },
      ],
    },
  ],
} as unknown as Output; // typecasting to allow invalid data
