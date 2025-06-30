// Shared event emitting utility for BerryExecutor and Runtime
export async function emitEvent(
  events: { [key: string]: Function },
  eventName: string,
  payload: any
) {
  if (events && typeof events[eventName] === "function") {
    await events[eventName](payload);
  }
}
