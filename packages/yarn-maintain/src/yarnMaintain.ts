import { YarnMaintainParams } from './yarnMaintainParams'
import { parse, stringify } from '@yarnpkg/lockfile'
import { permute } from './util/permute'

export function yarnMaintain(params: YarnMaintainParams) {
  const { lockfileString, modules, scopes, filters } = params
  const lockfileEither = parse(lockfileString)

  if (lockfileEither.type !== 'success') {
    throw new Error(lockfileEither.object)
  }

  const lockfile = lockfileEither.object as Record<
    string,
    Record<string, undefined> | undefined
  >

  const modulesP = modules.length
    ? modules.map((m) => `${m}@`)
    : ([null] as (string | null)[])
  const scopesP = scopes.length ? scopes : ([null] as (string | null)[])
  const filtersP = filters.length
    ? filters.map((f) => new RegExp(f))
    : ([null] as (RegExp | null)[])

  const and = permute([modulesP, scopesP, filtersP])

  for (const installedModule of Object.keys(lockfile)) {
    for (const [moduleAt, scope, filter] of and) {
      if (moduleAt && !installedModule.startsWith(moduleAt)) {
        continue
      }

      if (scope && !installedModule.startsWith(`@${scope}`)) {
        continue
      }

      if (filter && !installedModule.match(filter)) {
        continue
      }

      lockfile[installedModule] = undefined
      break
    }
  }

  return stringify(lockfile)
}
