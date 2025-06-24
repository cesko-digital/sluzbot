import OpenAI from "openai";

/**
 * A simple wrapper around `OpenAI.responses.create` with retry on rate limits
 *
 * https://platform.openai.com/account/rate-limits
 */
export async function createResponseWithRetry(
  openAI: OpenAI,
  body: OpenAI.Responses.ResponseCreateParamsNonStreaming
) {
  let delay = 2;
  let attemptNumber = 1;
  const maxAttempts = 5;

  while (true) {
    try {
      return await openAI.responses.create(body);
    } catch (error) {
      if (isRateLimitError(error)) {
        if (attemptNumber > maxAttempts) {
          // Attempt limit exceeded, just rethrow
          console.error(`Rate limited beyond repair, giving up.`);
          throw error;
        } else {
          console.warn(
            `Rate limited during attempt #${attemptNumber}, will sleep for ${delay} seconds.`
          );
          await sleep(delay);
          delay = delay * 2;
          attemptNumber++;
        }
      } else {
        // Not rate limiting error, just rethrow
        throw error;
      }
    }
  }
}

const isRateLimitError = (error: unknown) =>
  error instanceof OpenAI.APIError && error.code === "rate_limit_exceeded";

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));
