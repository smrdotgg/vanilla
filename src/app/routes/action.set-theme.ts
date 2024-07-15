import { createThemeAction } from "remix-themes"
import { themeSessionResolver } from "~/app/sessions.server"


export const action = createThemeAction(themeSessionResolver)

