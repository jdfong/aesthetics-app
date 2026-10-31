import { z } from "zod";

// One interaction as the phone sends it. The user id is never taken from the
// body; the server attaches it from the session cookie.
export const ClientEvent = z.object({
  id: z.uuid(),
  type: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
  sessionId: z.uuid().nullish(),
  itemId: z.uuid().nullish(),
  itemVersion: z.number().int().nullish(),
  payload: z.record(z.string(), z.unknown()).default({}),
  clientTs: z.iso.datetime({ offset: true }).nullish(),
});

export const MAX_BATCH = 100;
export const MAX_PAYLOAD_BYTES = 4096;

export const EventBatch = z.object({
  events: z.array(ClientEvent).min(1).max(MAX_BATCH),
});

export type ClientEvent = z.infer<typeof ClientEvent>;
