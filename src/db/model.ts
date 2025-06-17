import {
  array,
  decodeType,
  field,
  optional,
  record,
  string,
} from "typescript-json-decoder";
import {
  decodeAttachment,
  getTableById,
  logErrorAndReturnNull,
} from "./shared";

const table = () => getTableById("tblKKPynb6cLQEGrA");

export type Model = decodeType<typeof decodeModel>;
const decodeModel = record({
  id: field("ID", string),
  name: field("Name", string),
  llm: field("LLM", string),
  prompt: field("Prompt", string),
  context: field("Context", array(decodeAttachment)),
  vectorStoreId: field("Vector Store ID", optional(string)),
});

export const getAllModels = () =>
  table()
    .select()
    .all()
    .then((val) => val.map((r) => r.fields))
    .then(array(decodeModel))
    .catch(logErrorAndReturnNull);

export const getModelById = (modelId: string) =>
  table()
    .find(modelId)
    .then((record) => record.fields)
    .then(decodeModel)
    .catch(logErrorAndReturnNull);
