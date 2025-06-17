import Airtable from "airtable";
import { array, number, record, string } from "typescript-json-decoder";

/**
 * The Airtable base with our tables
 *
 * Creating this objects reads `AIRTABLE_API_TOKEN` from env.
 */
export const getTableById = (tableId: string) =>
  new Airtable().base("appoVMy46LJ2cmQQl")(tableId);

/**
 * Decode Airtable lookup field
 *
 * Lookup fields are represented as arrays of strings in the API.
 */
export const decodeLookupField = (value: unknown) => {
  const records = array(string)(value);
  return records.at(0);
};

/**
 * Decode Airtable linked record field
 *
 * Linked records are represented as arrays of record IDs in the API.
 */
export const decodeLinkedRecord = decodeLookupField;

/** Decode Airtable Attachment field */
export const decodeAttachment = record({
  id: string,
  url: string,
  filename: string,
  type: string,
  size: number,
});

export const logErrorAndReturnNull = (e: Error) => {
  console.error(e);
  return null;
};

export const logJsonValueAndContinue = <T>(val: T): T => {
  console.log(JSON.stringify(val, null, 2));
  return val;
};
