import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as z from 'zod';

// The data file is treated as user created/editable content,
// so validate it at startup and before building the semantic index.
const InterviewAnswerSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  questions: z.array(z.string().trim().min(1)).min(1),
  answer: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).optional()
});

const DataModelSchema = z
  .array(InterviewAnswerSchema)
  .min(1)
  .superRefine((records, context) => {
    const ids = new Set<string>();

    records.forEach((record, index) => {
      if (ids.has(record.id)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `Duplicate ID: ${record.id}`
        });
      }

      ids.add(record.id);
    });
  });

export type InterviewAnswer = z.infer<typeof InterviewAnswerSchema>;
export type IndexRecord = {
  answerId: string;
  question: string;
  answer: string;
};

function getDataModelPath() {
  return (
    process.env.DATA_MODEL_PATH ??
    fileURLToPath(new URL('../data/data-model.json', import.meta.url))
  );
}

export function readData(): InterviewAnswer[] {
  const path = getDataModelPath();
  let rawData: string;

  try {
    rawData = readFileSync(path, 'utf-8');
  } catch (e) {
    throw new Error(`Unable to read data model at "${path}"`, {
      cause: e
    });
  }

  let parsedData: unknown;

  try {
    parsedData = JSON.parse(rawData);
  } catch (e) {
    throw new Error(`Data model at "${path}" is not valid JSON`, {
      cause: e
    });
  }

  const result = DataModelSchema.safeParse(parsedData);

  if (!result.success) {
    throw new Error(`Invalid data model:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}

export function createIndexRecords(
  dataModel: InterviewAnswer[]
): IndexRecord[] {
  return dataModel.flatMap(record =>
    record.questions.map(question => ({
      answerId: record.id,
      question,
      answer: record.answer
    }))
  );
}

export function getSampleQuestions(dataModel: InterviewAnswer[]): string[] {
  return dataModel
    .map(records => records.questions[0] ?? '')
    .filter(question => question)
    .splice(0, 20);
}
