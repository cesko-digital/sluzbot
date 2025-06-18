#!/usr/bin/env -S npx tsx -r tsconfig-paths/register -r dotenv-flow/config

import { getAllEvals, saveEval } from "@/src/db/evals";
import {
  doesModelNeedVectorStoreUpdate,
  getAllModels,
  saveModel,
  updateVectorStore,
} from "@/src/db/model";
import { getAllQuestions } from "@/src/db/question";
import OpenAI from "openai";

async function main() {
  const openAI = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  const existingEvals = (await getAllEvals()) ?? [];
  const models = (await getAllModels()) ?? [];
  const questions = (await getAllQuestions()) ?? [];
  console.log(
    `Downloaded ${models.length} model(s), ${questions.length} questions and ${existingEvals.length} existing evals.`
  );

  for (let model of models) {
    const pendingQuestions = questions.filter(
      (q) =>
        !existingEvals.find(
          (e) => e.questionId === q.id && e.modelId === model.id
        )
    );
    if (pendingQuestions.length === 0) {
      console.log(
        `No evals needed for model ${model.name}, all questions answered.`
      );
      continue;
    }

    if (doesModelNeedVectorStoreUpdate(model)) {
      console.log(`Model needs context refresh, will do now.`);
      model = await updateVectorStore(model, openAI);
      await saveModel(model);
    }

    console.log(
      `Will run ${pendingQuestions.length} questions for model ${model.name}:`
    );

    for (const question of pendingQuestions) {
      const response = await openAI.responses.create({
        model: model.llm,
        input: question.question,
        instructions: model.prompt,
        tools: [
          {
            type: "file_search",
            vector_store_ids: [model.vectorStoreId!],
          },
        ],
      });

      if (!response.error) {
        await saveEval({
          modelId: model.id,
          questionId: question.id,
          response: response.output_text,
        });
        console.log(`- ${question.name}`);
      } else {
        console.error(response.error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
