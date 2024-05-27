import { EventEmitter } from "events";
import { remember } from "@epic-web/remember";
import { userIdQueryArg } from "./use-live-loader";

// export const emitter = remember("emitter", () => new EventEmitter());
// fake emitter below
export const emitter = {
  emit: (src: string) => {},
  addListener: (src: string, handler: () => void) => {},
  removeListener: (src: string, handler: () => void) => {},
}

export const EVENTS = {
  DOMAIN_PURCHASED: ({  userId }: { userId: string }) => {
    const src= `/events/domains/?${userIdQueryArg(userId)}`;
    emitter.emit(src);
  },
};

