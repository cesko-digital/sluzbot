#!/usr/bin/env -S npx tsx -r tsconfig-paths/register -r dotenv-flow/config

import OpenAI from "openai";
import {
  doesModelNeedVectorStoreUpdate,
  getAllModels,
  saveModel,
  updateVectorStore,
} from "@/src/db/model";

async function main() {
  const openAI = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  const models = (await getAllModels()) ?? [];
  console.log(`Found ${models.length} model(s) in the database.`);
  for (const model of models) {
    if (doesModelNeedVectorStoreUpdate(model)) {
      console.log(
        `Model ${model.name} needs vector store update, will update now.`
      );
      const updatedModel = await updateVectorStore(model, openAI);
      await saveModel(updatedModel);
    } else {
      console.log(`Model ${model.name} needs no update.`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
