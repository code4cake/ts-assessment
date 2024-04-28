import { array, mixed, number, string, lazy, object, ObjectSchema } from 'yup';

import { ENTITY_CLASS, ENTITY_TYPE, EntityClass, EntityType } from '../types/input';
import type {
  Output,
  ConvertedAnnotation,
  ConvertedEntity,
  ConvertedDocument,
  ConvertedEntityIdName,
} from '../types/output';

const EntityIdNameSchema: ObjectSchema<ConvertedEntityIdName> = object({
  id: string().required(),
  name: string().required(),
});

// [FIXME]: Fix issue with the value type allowing null and using the yup.mixed<AnyPresentValue>
// @ts-expect-error - Type 'null' is not assignable to type 'string | number | undefined'.
const ConvertedAnnotationSchema: ObjectSchema<ConvertedAnnotation> = object({
  id: string().required(),
  entity: EntityIdNameSchema.required(),
  value: mixed()
    .nullable()
    .test(
      'is-string-number-or-null',
      'Value must be a string, number, or null',
      (value) => value === null || typeof value === 'string' || typeof value === 'number',
    )
    .required(),
  index: number().required(),
  children: array()
    .of(lazy(() => ConvertedAnnotationSchema))
    .required(),
});

const ConvertedEntitySchema: ObjectSchema<ConvertedEntity> = object({
  id: string().required(),
  name: string().required(),
  type: mixed<EntityType>().oneOf(Object.values(ENTITY_TYPE)).required(),
  class: mixed<EntityClass>().oneOf(Object.values(ENTITY_CLASS)).required(),
  children: array()
    .of(lazy(() => ConvertedEntitySchema))
    .required(),
});

const ConvertedDocumentSchema: ObjectSchema<ConvertedDocument> = object({
  id: string().required(),
  entities: array(ConvertedEntitySchema).required(),
  annotations: array()
    .of(lazy(() => ConvertedAnnotationSchema))
    .required(),
});

export const OutputSchema: ObjectSchema<Output> = object({
  documents: array(ConvertedDocumentSchema).required(),
});

export default OutputSchema;
