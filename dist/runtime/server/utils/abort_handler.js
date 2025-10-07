export function getAbortSignal(event) {
  const abortController = new AbortController();
  event.node.res.on("close", () => {
    abortController.abort();
  });
  return abortController.signal;
}
