function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

export namespace Flag {
  export const OPENMODS_AUTO_SHARE = truthy("OPENMODS_AUTO_SHARE")
  export const OPENMODS_GIT_BASH_PATH = process.env["OPENMODS_GIT_BASH_PATH"]
  export const OPENMODS_CONFIG = process.env["OPENMODS_CONFIG"]
  export declare const OPENMODS_TUI_CONFIG: string | undefined
  export declare const OPENMODS_CONFIG_DIR: string | undefined
  export const OPENMODS_CONFIG_CONTENT = process.env["OPENMODS_CONFIG_CONTENT"]
  export const OPENMODS_DISABLE_AUTOUPDATE = truthy("OPENMODS_DISABLE_AUTOUPDATE")
  export const OPENMODS_DISABLE_PRUNE = truthy("OPENMODS_DISABLE_PRUNE")
  export const OPENMODS_DISABLE_TERMINAL_TITLE = truthy("OPENMODS_DISABLE_TERMINAL_TITLE")
  export const OPENMODS_PERMISSION = process.env["OPENMODS_PERMISSION"]
  export const OPENMODS_DISABLE_DEFAULT_PLUGINS = truthy("OPENMODS_DISABLE_DEFAULT_PLUGINS")
  export const OPENMODS_DISABLE_LSP_DOWNLOAD = truthy("OPENMODS_DISABLE_LSP_DOWNLOAD")
  export const OPENMODS_ENABLE_EXPERIMENTAL_MODELS = truthy("OPENMODS_ENABLE_EXPERIMENTAL_MODELS")
  export const OPENMODS_DISABLE_AUTOCOMPACT = truthy("OPENMODS_DISABLE_AUTOCOMPACT")
  export const OPENMODS_DISABLE_MODELS_FETCH = truthy("OPENMODS_DISABLE_MODELS_FETCH")
  export const OPENMODS_DISABLE_CLAUDE_CODE = truthy("OPENMODS_DISABLE_CLAUDE_CODE")
  export const OPENMODS_DISABLE_CLAUDE_CODE_PROMPT =
    OPENMODS_DISABLE_CLAUDE_CODE || truthy("OPENMODS_DISABLE_CLAUDE_CODE_PROMPT")
  export const OPENMODS_DISABLE_CLAUDE_CODE_SKILLS =
    OPENMODS_DISABLE_CLAUDE_CODE || truthy("OPENMODS_DISABLE_CLAUDE_CODE_SKILLS")
  export const OPENMODS_DISABLE_EXTERNAL_SKILLS =
    OPENMODS_DISABLE_CLAUDE_CODE_SKILLS || truthy("OPENMODS_DISABLE_EXTERNAL_SKILLS")
  export declare const OPENMODS_DISABLE_PROJECT_CONFIG: boolean
  export const OPENMODS_FAKE_VCS = process.env["OPENMODS_FAKE_VCS"]
  export declare const OPENMODS_CLIENT: string
  export const OPENMODS_SERVER_PASSWORD = process.env["OPENMODS_SERVER_PASSWORD"]
  export const OPENMODS_SERVER_USERNAME = process.env["OPENMODS_SERVER_USERNAME"]
  export const OPENMODS_ENABLE_QUESTION_TOOL = truthy("OPENMODS_ENABLE_QUESTION_TOOL")

  // Experimental
  export const OPENMODS_EXPERIMENTAL = truthy("OPENMODS_EXPERIMENTAL")
  export const OPENMODS_EXPERIMENTAL_FILEWATCHER = truthy("OPENMODS_EXPERIMENTAL_FILEWATCHER")
  export const OPENMODS_EXPERIMENTAL_DISABLE_FILEWATCHER = truthy("OPENMODS_EXPERIMENTAL_DISABLE_FILEWATCHER")
  export const OPENMODS_EXPERIMENTAL_ICON_DISCOVERY =
    OPENMODS_EXPERIMENTAL || truthy("OPENMODS_EXPERIMENTAL_ICON_DISCOVERY")

  const copy = process.env["OPENMODS_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
  export const OPENMODS_EXPERIMENTAL_DISABLE_COPY_ON_SELECT =
    copy === undefined ? process.platform === "win32" : truthy("OPENMODS_EXPERIMENTAL_DISABLE_COPY_ON_SELECT")
  export const OPENMODS_ENABLE_EXA =
    truthy("OPENMODS_ENABLE_EXA") || OPENMODS_EXPERIMENTAL || truthy("OPENMODS_EXPERIMENTAL_EXA")
  export const OPENMODS_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS = number("OPENMODS_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS")
  export const OPENMODS_EXPERIMENTAL_OUTPUT_TOKEN_MAX = number("OPENMODS_EXPERIMENTAL_OUTPUT_TOKEN_MAX")
  export const OPENMODS_EXPERIMENTAL_OXFMT = OPENMODS_EXPERIMENTAL || truthy("OPENMODS_EXPERIMENTAL_OXFMT")
  export const OPENMODS_EXPERIMENTAL_LSP_TY = truthy("OPENMODS_EXPERIMENTAL_LSP_TY")
  export const OPENMODS_EXPERIMENTAL_LSP_TOOL = OPENMODS_EXPERIMENTAL || truthy("OPENMODS_EXPERIMENTAL_LSP_TOOL")
  export const OPENMODS_DISABLE_FILETIME_CHECK = truthy("OPENMODS_DISABLE_FILETIME_CHECK")
  export const OPENMODS_EXPERIMENTAL_PLAN_MODE = OPENMODS_EXPERIMENTAL || truthy("OPENMODS_EXPERIMENTAL_PLAN_MODE")
  export const OPENMODS_EXPERIMENTAL_WORKSPACES = OPENMODS_EXPERIMENTAL || truthy("OPENMODS_EXPERIMENTAL_WORKSPACES")
  export const OPENMODS_EXPERIMENTAL_MARKDOWN = !falsy("OPENMODS_EXPERIMENTAL_MARKDOWN")
  export const OPENMODS_MODELS_URL = process.env["OPENMODS_MODELS_URL"]
  export const OPENMODS_MODELS_PATH = process.env["OPENMODS_MODELS_PATH"]
  export const OPENMODS_DISABLE_CHANNEL_DB = truthy("OPENMODS_DISABLE_CHANNEL_DB")
  export const OPENMODS_SKIP_MIGRATIONS = truthy("OPENMODS_SKIP_MIGRATIONS")
  export const OPENMODS_STRICT_CONFIG_DEPS = truthy("OPENMODS_STRICT_CONFIG_DEPS")

  function number(key: string) {
    const value = process.env[key]
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
}

// Dynamic getter for OPENMODS_DISABLE_PROJECT_CONFIG
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "OPENMODS_DISABLE_PROJECT_CONFIG", {
  get() {
    return truthy("OPENMODS_DISABLE_PROJECT_CONFIG")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for OPENMODS_TUI_CONFIG
// This must be evaluated at access time, not module load time,
// because tests and external tooling may set this env var at runtime
Object.defineProperty(Flag, "OPENMODS_TUI_CONFIG", {
  get() {
    return process.env["OPENMODS_TUI_CONFIG"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for OPENMODS_CONFIG_DIR
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "OPENMODS_CONFIG_DIR", {
  get() {
    return process.env["OPENMODS_CONFIG_DIR"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for OPENMODS_CLIENT
// This must be evaluated at access time, not module load time,
// because some commands override the client at runtime
Object.defineProperty(Flag, "OPENMODS_CLIENT", {
  get() {
    return process.env["OPENMODS_CLIENT"] ?? "cli"
  },
  enumerable: true,
  configurable: false,
})
