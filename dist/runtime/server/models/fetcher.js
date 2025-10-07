import { getAbortSignal } from "../utils/abort_handler.js";
export async function defaultFetcher(options) {
  const { url, method, body, headers, event } = options;
  const signal = getAbortSignal(event);
  return await $fetch(url, {
    method,
    body: JSON.stringify(body),
    headers,
    signal
  });
}
