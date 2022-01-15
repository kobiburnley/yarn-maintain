import { exec } from 'child_process'
import { tryCatchAsync } from 'fp-error'

export function readYarnVersion({
  cwd = process.cwd(),
}: { cwd?: string } = {}) {
  return tryCatchAsync(
    () =>
      new Promise<string>((resolve, reject) => {
        exec(
          'yarn --version',
          {
            cwd,
          },
          (error, out) => {
            if (error) {
              reject(new Error(error.message))
            } else {
              resolve(out.trim())
            }
          },
        )
      }),
  )
}
