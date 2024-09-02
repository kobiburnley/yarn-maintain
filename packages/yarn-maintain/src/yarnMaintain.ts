import { YarnMaintainParams } from './yarnMaintainParams'
import { parse, stringify } from '@yarnpkg/lockfile'
import { parseSyml, stringifySyml } from '@yarnpkg/parsers'
import { permute } from './util/permute'
import { promises as fs } from 'fs'
import { readYarnVersion } from './readYarnVersion'
import { isRight } from 'fp-ts/Either'
import { tryCatch } from 'fp-error'
import { isLeft } from 'fp-ts/lib/Either'
import { satisfies } from 'semver'
type YarnLock = Record<string, Record<string, undefined> | undefined>

export async function yarnMaintain(params: YarnMaintainParams) {
  const { modules, scopes, filters } = params

  const [lockfileString, yarnVersionEither] = await Promise.all([
    fs.readFile('yarn.lock', 'utf8'),
    readYarnVersion(),
  ])

  const yaml = isRight(yarnVersionEither)
    ? satisfies(yarnVersionEither.right, '>=3.0.0')
    : false

  const yarnLockEither = tryCatch(() => {
    if (yaml) {
      return parseSyml(lockfileString) as YarnLock
    }

    const lockfileEither = parse(lockfileString)

    if (lockfileEither.type !== 'success') {
      throw new Error(lockfileEither.object)
    }

    return lockfileEither.object as YarnLock
  })

  if (isLeft(yarnLockEither)) {
    throw yarnLockEither.left
  }

  const yarnLock = yarnLockEither.right

  const modulesP = modules.length
    ? modules.map((m) => `${m}@`)
    : ([null] as (string | null)[])
  const scopesP = scopes.length ? scopes : ([null] as (string | null)[])
  const filtersP = filters.length
    ? filters.map((f) => new RegExp(f))
    : ([null] as (RegExp | null)[])

  const and = permute([modulesP, scopesP, filtersP])

  for (const installedModule of Object.keys(yarnLock)) {
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

      yarnLock[installedModule] = undefined
      break
    }
  }
  await fs.writeFile(
    'yarn.lock',
    yaml ? stringifySyml(yarnLock) : stringify(yarnLock),
  )
}
