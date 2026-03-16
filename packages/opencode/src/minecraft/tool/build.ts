import { Process } from "@/util/process"
import path from "path"
import { Filesystem } from "@/util/filesystem"
import { readdir } from "fs/promises"

/**
 * Build Options
 */
export interface BuildOptions {
  workspace: string
  clean?: boolean
  debug?: boolean
}

/**
 * Build Result
 */
export interface BuildResult {
  success: boolean
  output: string
  error?: string
  jarPath?: string
}

/**
 * Run Gradle build
 */
export async function runGradleBuild(options: BuildOptions): Promise<BuildResult> {
  const { workspace, clean = false, debug = false } = options
  
  // Check if gradlew exists
  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew"
  const gradlewPath = path.join(workspace, gradlew)
  const gradlewExists = await Filesystem.exists(gradlewPath)
  
  if (!gradlewExists) {
    return {
      success: false,
      output: "",
      error: "Gradle wrapper not found. Please initialize a Gradle project first.",
    }
  }
  
  // Build command
  const args = ["build"]
  if (clean) {
    args.unshift("clean")
  }
  if (debug) {
    args.push("--info")
  }
  
  try {
    const result = await Process.run([gradlew, ...args], {
      cwd: workspace,
      timeout: 300000, // 5 minutes
    })
    
    const output = result.stdout.toString()
    const error = result.stderr.toString()
    
    if (result.code !== 0) {
      return {
        success: false,
        output,
        error: parseBuildError(error || output),
      }
    }
    
    // Find the built JAR
    const jarPath = await findJarFile(workspace)
    
    return {
      success: true,
      output,
      jarPath,
    }
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Find built JAR file
 */
async function findJarFile(workspace: string): Promise<string | undefined> {
  const buildDir = path.join(workspace, "build", "libs")
  
  try {
    const files = await readdir(buildDir)
    const jarFile = files.find(f => 
      f.endsWith(".jar") && !f.includes("-sources") && !f.includes("-javadoc")
    )
    
    if (jarFile) {
      return path.join(buildDir, jarFile)
    }
  } catch {
    // Directory doesn't exist
  }
  
  return undefined
}

/**
 * Parse build error from output
 */
function parseBuildError(output: string): string {
  const lines = output.split("\n")
  const errorLines: string[] = []
  let inError = false
  
  for (const line of lines) {
    if (line.includes("error:") || line.includes("FAILED")) {
      inError = true
    }
    if (inError) {
      errorLines.push(line)
      if (errorLines.length > 20) break // Limit error output
    }
  }
  
  return errorLines.join("\n") || output.slice(0, 500)
}

/**
 * Run Gradle task
 */
export async function runGradleTask(
  workspace: string,
  task: string,
  args: string[] = []
): Promise<BuildResult> {
  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew"
  
  try {
    const result = await Process.run([gradlew, task, ...args], {
      cwd: workspace,
      timeout: 300000,
    })
    
    return {
      success: result.code === 0,
      output: result.stdout.toString(),
      error: result.code !== 0 ? result.stderr.toString() : undefined,
    }
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Run Minecraft with the mod
 */
export async function runMinecraft(workspace: string): Promise<BuildResult> {
  return runGradleTask(workspace, "runClient")
}

/**
 * Clean build artifacts
 */
export async function cleanBuild(workspace: string): Promise<BuildResult> {
  return runGradleTask(workspace, "clean")
}