import { Theme } from "remix-themes";
import { env } from "~/utils/env";

  export const BACKUP_THEME =
    env.PUBLIC_ENV === "development" ? Theme.LIGHT : Theme.LIGHT;
