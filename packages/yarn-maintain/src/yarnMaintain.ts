import { YarnMaintainParams } from './yarnMaintainParams'
import { parse, stringify } from '@yarnpkg/lockfile'

export function yarnMaintain({ lockfileString, modules }: YarnMaintainParams) {
  const lockfileEither = parse(lockfileString)

  if (lockfileEither.type !== 'success') {
    throw new Error(lockfileEither.object)
  }

  const lockfile = lockfileEither.object as Record<
    string,
    Record<string, undefined> | undefined
  >

  for (const installedModule of Object.keys(lockfile)) {
    for (const module of modules) {
      const st = `${module}@`
      if (installedModule.startsWith(st)) {
        lockfile[installedModule] = undefined
        break
      }
    }
  }



  return stringify(lockfile)
}
