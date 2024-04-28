import _ from 'lodash';

import type { Annotation, Entity, Input } from './types/input';
import type { ConvertedAnnotation, ConvertedEntity, Output } from './types/output';
import { OutputSchema } from './schemas/output.schema';
import { logger } from './utils/logger';

interface EntityStore {
  [key: string]: ConvertedEntity;
}
interface AnnotationStore {
  [key: string]: ConvertedAnnotation;
}

// TODO: Convert Input to the Output structure. Do this in an efficient and generic way.
// HINT: Make use of the helper library "lodash"
export const convertInput = (input: Input): Output => {
  const documents = _.map(input.documents, (document) => {
    // const annotations: ConvertedAnnotation[] = [];
    // TODO: map the entities to the new structure and sort them based on the property "name"
    // Make sure the nested children are also mapped and sorted
    const entityStore = createEmptyEntityStore(document.entities);
    const convertedAndSortedEntities = _.map(document.entities, (entity) => convertEntity(entity, entityStore)).sort(
      sortEntities,
    );

    // TODO: map the annotations to the new structure and sort them based on the property "index"
    // Make sure the nested children are also mapped and sorted
    const annotationStore = createEmptyAnnotationStore(document.annotations, entityStore);
    const processedAnnotationsRefs = processAnnotations(document.annotations, annotationStore);
    const sortedAnnotations = sortAnnotations(processedAnnotationsRefs);

    return {
      id: document.id,
      entities: convertedAndSortedEntities,
      annotations: sortedAnnotations,
    };
  });

  return { documents };
};

const processAnnotations = (annotations: Annotation[], annotationStore: AnnotationStore): ConvertedAnnotation[] => {
  const processedAnnotations: ConvertedAnnotation[] = [];

  _.forEach(annotations, (annotation) => {
    if (annotation.refs.length === 0) {
      processedAnnotations.push(convertAnnotation(annotation, annotationStore));
    } else {
      convertAnnotation(annotation, annotationStore);
    }
  });
  return processedAnnotations;
};

const createEmptyEntityStore = (entities: Entity[]): EntityStore => {
  const entityStore: EntityStore = {};
  _.forEach(entities, (entity) => {
    entityStore[entity.id] = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      class: entity.class,
      children: [],
    };
  });
  return entityStore;
};

const createEmptyAnnotationStore = (annotations: Annotation[], entityStore: EntityStore): AnnotationStore => {
  const annotationStore: AnnotationStore = {};

  _.forEach(annotations, (annotation) => {
    if (entityStore[annotation.entityId]) {
      annotationStore[annotation.id] = {
        id: annotation.id,
        entity: {
          id: entityStore[annotation.entityId].id,
          name: entityStore[annotation.entityId].name,
        },
        value: annotation.value,
        index: annotation.indices?.length ? annotation.indices[0].start : -1,
        children: [],
      };
    }
  });
  return annotationStore;
};

// HINT: you probably need to pass extra argument(s) to this function to make it performant
const convertEntity = (entity: Entity, entityStore: EntityStore): ConvertedEntity => {
  _.forEach(entity.refs, (refId: string) => {
    const parentEntity = entityStore[refId];

    if (parentEntity) {
      parentEntity.children.push(entityStore[entity.id]);
    }
  });

  entityStore[entity.id].children.sort(sortEntities);

  return entityStore[entity.id];
};

// HINT: you probably need to pass extra argument(s) to this function to make it performant.
const convertAnnotation = (annotation: Annotation, annotationStore: AnnotationStore): ConvertedAnnotation => {
  try {
    const annotationEntry = annotationStore[annotation.id];
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
      const refAnnotation = annotationStore[refId];
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
