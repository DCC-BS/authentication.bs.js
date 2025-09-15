import { readBody } from "h3";
export async function extractEventBody(event) {
  return readBody(event);
}
export async function noBody(_) {
  return void 0;
}
export function getDefaultBodyProvider(method) {
  switch (method) {
    case void 0:
      return noBody;
    case "GET":
    case "DELETE":
      return noBody;
    default:
      return extractEventBody;
  }
}
