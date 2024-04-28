import _ from 'lodash';

import type { Annotation, Entity, Input } from './types/input';
import type { ConvertedAnnotation, ConvertedEntity, Output } from './types/output';
import { OutputSchema } from './schemas/output.schema';
import { logger } from './utils/logger';

interface EntityMap {
  [key: string]: ConvertedEntity;
}
interface AnnotationMap {
  [key: string]: ConvertedAnnotation;
}

// TODO: Convert Input to the Output structure. Do this in an efficient and generic way.
// HINT: Make use of the helper library "lodash"
export const convertInput = (input: Input): Output => {
  const documents = _.map(input.documents, (document) => {
    const entityMap: EntityMap = {},
      annotationMap: AnnotationMap = {},
      annotations: ConvertedAnnotation[] = [];

    // TODO: map the entities to the new structure and sort them based on the property "name"
    // Make sure the nested children are also mapped and sorted
    _.forEach(document.entities, (entity) => {
      entityMap[entity.id] = {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        class: entity.class,
        children: [],
      };
    });

    // TODO: map the annotations to the new structure and sort them based on the property "index"
    // Make sure the nested children are also mapped and sorted
    _.forEach(document.annotations, (annotation) => {
      if (entityMap[annotation.entityId]) {
        annotationMap[annotation.id] = {
          id: annotation.id,
          entity: {
            id: entityMap[annotation.entityId].id,
            name: entityMap[annotation.entityId].name,
          },
          value: annotation.value,
          index: annotation.indices?.length ? annotation.indices[0].start : -1,
          children: [],
        };
      }
    });

    const entities = _.map(document.entities, (entity) => convertEntity(entity, entityMap)).sort(sortEntities);

    _.forEach(document.annotations, (annotation) => {
      if (annotation.refs.length === 0) {
        annotations.push(convertAnnotation(annotation, annotationMap));
      } else {
        convertAnnotation(annotation, annotationMap);
      }
    });

    const sortedAnnotations = sortAnnotations(annotations);

    return {
      id: document.id,
      entities,
      annotations: sortedAnnotations,
    };
  });

  return { documents };
};

// HINT: you probably need to pass extra argument(s) to this function to make it performant
const convertEntity = (entity: Entity, entityMap: EntityMap): ConvertedEntity => {
  _.forEach(entity.refs, (refId: string) => {
    const parentEntity = entityMap[refId];

    if (parentEntity) {
      parentEntity.children.push(entityMap[entity.id]);
    }
  });

  entityMap[entity.id].children.sort(sortEntities);

  return entityMap[entity.id];
};

// HINT: you probably need to pass extra argument(s) to this function to make it performant.
const convertAnnotation = (annotation: Annotation, annotationMap: AnnotationMap): ConvertedAnnotation => {
  try {
    const annotationEntry = annotationMap[annotation.id];
    if (!annotationEntry) {
      throw new Error(`Annotation with ID ${annotation.id} not found.`);
    }

    if (_.isEmpty(annotation.indices)) {
      if (_.isEmpty(annotationEntry.children)) {
        throw new Error('Cannot assign index for annotation.');
      } else {
        const sortedChildren = sortAnnotations(annotationEntry.children);
        annotationEntry.children = sortedChildren;
        annotationEntry.index = sortedChildren[0].index;
      }
    } else {
      annotationEntry.index = annotation.indices?.[0]?.start ?? -1;
    }

    _.forEach(annotation.refs, (refId: string) => {
      const refAnnotation = annotationMap[refId];
      if (!refAnnotation) {
        throw new Error(`Reference annotation with ID ${refId} not found.`);
      }
      refAnnotation.children.push(annotationEntry);
    });

    return annotationEntry;
  } catch (error) {
    logger.error(`Error converting annotation: ${error}`);
    throw error;
  }
};

export const sortEntities = (entityA: ConvertedEntity, entityB: ConvertedEntity): number => {
  return entityA.name.localeCompare(entityB.name);
};

export const sortAnnotations = (annotations: ConvertedAnnotation[]): ConvertedAnnotation[] => {
  return _.sortBy(annotations, 'index');
};

// BONUS: Create validation function that validates the result of "convertInput". Use yup as library to validate your result.
export const validateOutput = (output: Output) => {
  return OutputSchema.validate(output, { abortEarly: false })
    .then(() => {
      logger.info('Validation successful!');
      return true;
    })
    .catch((_err: unknown) => {
      // logger.error('Validation failed: ', error); // NOTE: uncomment to see validation failure details on tests
      return false;
    });
};
