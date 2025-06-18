import {
  array,
  decodeType,
  field,
  record,
  string,
} from "typescript-json-decoder";
import { getTableById, logErrorAndReturnNull } from "./shared";

const table = () => getTableById("tbl8EQjIK4Sz4EShu");

export type Question = decodeType<typeof decodeQuestion>;
const decodeQuestion = record({
  id: field("ID", string),
  name: field("Name", string),
  question: field("Question", string),
});

export const getAllQuestions = () =>
  table()
    .select()
    .all()
    .then((val) => val.map((r) => r.fields))
    .then(array(decodeQuestion))
    .catch(logErrorAndReturnNull);
