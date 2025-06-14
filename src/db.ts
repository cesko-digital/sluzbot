import Airtable from "airtable";
import { decodeType, field, record, string } from "typescript-json-decoder";

const base = new Airtable().base("appoVMy46LJ2cmQQl");
const table = base("tbl1FyksMUFTYj1uk");

export type Session = decodeType<typeof decodeSession>;
const decodeSession = record({
  databaseId: field("ID", string),
  sessionId: field("Session ID", string),
  lastResponseId: field("Last Response ID", string),
});

const logErrorAndReturnNull = (e: Error) => {
  console.error(e);
  return null;
};

export const getExistingSession = (id: string): Promise<Session | null> =>
  table
    .select({
      maxRecords: 1,
      filterByFormula: `{Session ID} = "${id}"`,
    })
    .all()
    .then((records) => records[0].fields)
    .then(decodeSession)
    .catch(logErrorAndReturnNull);

export const saveSession = (session: Session): Promise<Session | null> =>
  table
    .update(session.databaseId, {
      "Last Response ID": session.lastResponseId,
    })
    .then((record) => record.fields)
    .then(decodeSession)
    .catch(logErrorAndReturnNull);

export const createSession = (
  session: Omit<Session, "databaseId">
): Promise<Session | null> =>
  table
    .create({
      ID: session.sessionId,
      "Last Response ID": session.lastResponseId,
    })
    .then((record) => record.fields)
    .then(decodeSession)
    .catch(logErrorAndReturnNull);
