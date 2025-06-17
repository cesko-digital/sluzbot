import { decodeType, field, record, string } from "typescript-json-decoder";
import {
  decodeLinkedRecord,
  decodeLookupField,
  getTableById,
  logErrorAndReturnNull,
} from "./shared";

const table = () => getTableById("tbl1FyksMUFTYj1uk");

export const defaultModelId = "recDdQrpb7l8F7esJ";

export type Session = decodeType<typeof decodeSession>;
export const decodeSession = record({
  // Basic fields
  databaseId: field("ID", string),
  sessionId: field("Session ID", string),
  lastResponseId: field("Last Response ID", string),
  // Model link
  model: field("Model", decodeLinkedRecord),
  // Model lookup fields
  llm: field("LLM", decodeLookupField),
  vectorStoreId: field("Vector Store ID", decodeLookupField),
  prompt: field("Prompt", decodeLookupField),
});

export const getExistingSession = (id: string): Promise<Session | null> =>
  table()
    .select({
      maxRecords: 1,
      filterByFormula: `{Session ID} = "${id}"`,
    })
    .all()
    .then((records) => records[0].fields)
    .then(decodeSession)
    .catch(logErrorAndReturnNull);

export const saveSession = (session: Session): Promise<Session | null> =>
  table()
    .update(session.databaseId, {
      "Last Response ID": session.lastResponseId,
    })
    .then((record) => record.fields)
    .then(decodeSession)
    .catch(logErrorAndReturnNull);

export const createSession = (
  session: Omit<Session, "databaseId">
): Promise<Session | null> =>
  table()
    .create({
      "Session ID": session.sessionId,
      "Last Response ID": session.lastResponseId,
      "Model": defaultModelId,
    })
    .then((record) => record.fields)
    .then(decodeSession)
    .catch(logErrorAndReturnNull);
