import {
  array,
  date,
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
import OpenAI from "openai";

const table = () => getTableById("tblKKPynb6cLQEGrA");

export type Model = decodeType<typeof decodeModel>;
const decodeModel = record({
  id: field("ID", string),
  name: field("Name", string),
  llm: field("LLM", string),
  prompt: field("Prompt", string),
  context: field("Context", array(decodeAttachment)),
  vectorStoreId: field("Vector Store ID", optional(string)),
  lastContextUpdate: field("Last Context Update", optional(date)),
  lastVectorStoreUpdate: field("Last Vector Store Update", optional(date)),
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

export const saveModel = (model: Model) =>
  table()
    .update(model.id, {
      "Last Vector Store Update": model.lastVectorStoreUpdate?.toISOString(),
      "Vector Store ID": model.vectorStoreId,
    })
    .then((record) => record.fields)
    .then(decodeModel)
    .catch(logErrorAndReturnNull);

export function doesModelNeedVectorStoreUpdate(
  model: Pick<Model, "lastContextUpdate" | "lastVectorStoreUpdate">
): boolean {
  return (
    !!model.lastContextUpdate &&
    (!model.lastVectorStoreUpdate ||
      model.lastVectorStoreUpdate < model.lastContextUpdate)
  );
}

/**
 * Update vector store after model context has changed
 *
 * Existing vector store will be deleted first (!).
 *
 * Returns an updated model.
 */
export async function updateVectorStore(
  model: Model,
  openAI: OpenAI
): Promise<Model> {
  if (model.vectorStoreId) {
    console.log(
      `Model has existing store ${model.vectorStoreId}, will delete it first.`
    );
    await openAI.vectorStores.delete(model.vectorStoreId);
  }

  const store = await openAI.vectorStores.create({ name: model.name });
  console.log(`Created new store ${store.id}.`);

  console.log(
    `Uploading model context (${model.context.length} files) into store:`
  );
  for (const attachment of model.context) {
    console.log(`- ${attachment.filename}, ${attachment.size} bytes`);
    const fileResponse = await fetch(attachment.url);
    const buffer = await fileResponse.arrayBuffer();
    const file = new File([buffer], attachment.filename);
    const fileUploadResponse = await openAI.files.create({
      purpose: "assistants",
      file,
    });
    await openAI.vectorStores.files.create(store.id, {
      file_id: fileUploadResponse.id,
    });
  }

  return {
    ...model,
    vectorStoreId: store.id,
    lastVectorStoreUpdate: new Date(),
  };
}
