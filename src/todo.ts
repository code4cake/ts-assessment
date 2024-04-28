// import _ from 'lodash';

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
  const documents = input.documents.map((document) => {
    const entityMap: EntityMap = {},
      annotationMap: AnnotationMap = {},
      annotations: ConvertedAnnotation[] = [];

    // TODO: map the entities to the new structure and sort them based on the property "name"
    // Make sure the nested children are also mapped and sorted
    document.entities.forEach((entity) => {
      entityMap[entity.id] = {
        ...{ id: entity.id, name: entity.name, type: entity.type, class: entity.class },
        children: [],
      };
    });

    // TODO: map the annotations to the new structure and sort them based on the property "index"
    // Make sure the nested children are also mapped and sorted
    document.annotations.forEach((annotation) => {
      annotationMap[annotation.id] = {
        ...{
          id: annotation.id,
          entity: {
            id: entityMap[annotation.entityId].id,
            name: entityMap[annotation.entityId].name,
          },
          value: annotation.value,
          index: -1,
          children: [],
        },
      };
    });

    const entities: ConvertedEntity[] = document.entities
      .map((entity) => convertEntity(entity, entityMap))
      .sort(sortEntities);

    document.annotations.forEach((annotation) => {
      annotation.refs.length < 1
        ? annotations.push(convertAnnotation(annotation, annotationMap))
        : convertAnnotation(annotation, annotationMap);
    });

    annotations.sort(sortAnnotations);

    return {
      id: document.id,
      entities,
      annotations,
    };
  });

  return { documents };
};

// HINT: you probably need to pass extra argument(s) to this function to make it performant
const convertEntity = (entity: Entity, entityMap: EntityMap): ConvertedEntity => {
  entity.refs.forEach((refId: string) => {
    if (entityMap[refId]) {
      entityMap[refId].children.push({ ...entityMap[entity.id] });
    }
  });

  entityMap[entity.id].children.sort(sortEntities);

  return entityMap[entity.id];
};

// HINT: you probably need to pass extra argument(s) to this function to make it performant.
const convertAnnotation = (annotation: Annotation, annotationMap: AnnotationMap): ConvertedAnnotation => {
  try {
    if (!annotationMap[annotation.id]) {
      throw new Error(`Annotation with ID ${annotation.id} not found.`);
    }

    if (annotation.indices && annotation.indices.length > 0) {
      annotationMap[annotation.id].index = annotation.indices[0].start;
    } else if (annotationMap[annotation.id].children.length > 0) {
      annotationMap[annotation.id].children.sort(sortAnnotations);
      annotationMap[annotation.id].index = annotationMap[annotation.id].children[0].index;
    } else {
      throw new Error('Cannot assign index for annotation.');
    }

    annotation.refs.forEach((refId: string) => {
      if (!annotationMap[refId]) {
        throw new Error(`Reference annotation with ID ${refId} not found.`);
      }

      annotationMap[refId].children.push(annotationMap[annotation.id]);
    });

    return annotationMap[annotation.id];
  } catch (error) {
    error instanceof Error && logger.error(`Error converting annotation: ${error.message}`);
    throw error;
  }
};

export const sortEntities = (entityA: ConvertedEntity, entityB: ConvertedEntity): number => {
  return entityA.name.localeCompare(entityB.name);
};

export const sortAnnotations = (annotationA: ConvertedAnnotation, annotationB: ConvertedAnnotation): number => {
  return annotationA.index - annotationB.index;
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
