import {
  array,
  decodeType,
  field,
  optional,
  record,
  string,
} from "typescript-json-decoder";
import {
  decodeLinkedRecord,
  getTableById,
  logErrorAndReturnNull,
} from "./shared";

const table = () => getTableById("tblNQJQwsfryalwHd");

export type Eval = decodeType<typeof decodeEval>;
const decodeEval = record({
  id: field("ID", string),
  modelId: field("Model", decodeLinkedRecord),
  questionId: field("Question", decodeLinkedRecord),
  response: field("Response", optional(string)),
});

export const getAllEvals = () =>
  table()
    .select()
    .all()
    .then((val) => val.map((r) => r.fields))
    .then(array(decodeEval))
    .catch(logErrorAndReturnNull);

export const saveEval = (e: Omit<Eval, "id">) =>
  table()
    .create({
      Model: [e.modelId!],
      Question: [e.questionId!],
      Response: e.response,
    })
    .then((response) => response.fields)
    .then(decodeEval)
    .catch(logErrorAndReturnNull);
