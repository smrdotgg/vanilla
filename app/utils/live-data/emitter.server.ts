import { EventEmitter } from "events";
import { remember } from "@epic-web/remember";
import { userIdQueryArg } from "./use-live-loader";

export const emitter = remember("emitter", () => new EventEmitter());

export const EVENTS = {
  DOMAIN_PURCHASED: ({  userId }: { userId: string }) => {
    const src= `/events/domains/?${userIdQueryArg(userId)}`;
    console.log("Emitting event at");
    console.log(src);
    emitter.emit(src);
  },
};

