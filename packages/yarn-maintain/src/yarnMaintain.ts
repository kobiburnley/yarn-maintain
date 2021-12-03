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

  const modulesAt = modules.map((m) => `${m}@`)

  for (const installedModule of Object.keys(lockfile)) {
    for (const moduleAt of modulesAt) {
      if (installedModule.startsWith(moduleAt)) {
        lockfile[installedModule] = undefined
        break
      }
    }
  }

  return stringify(lockfile)
}
