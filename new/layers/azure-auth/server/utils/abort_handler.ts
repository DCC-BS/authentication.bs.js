import type { H3Event } from "h3";

export function getAbortSignal(event: H3Event): AbortSignal {
  const abortController = new AbortController();
  event.node.res.on("close", () => {
    abortController.abort();
  });
  return abortController.signal;
}
