import minimist from 'minimist'
import {
  isYarnMaintainCLIHelpArgs,
  toYarnMaintainParams,
  yarnMaintainCLIArgsOrHelp,
} from './yarnMaintainCLIArgs'
import { isLeft } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

import { promises as fs } from 'fs'

import { yarnMaintain } from './yarnMaintain'

;(async () => {
  try {
    const argsEither = yarnMaintainCLIArgsOrHelp.decode(
      minimist(process.argv.slice(2)),
    )

    if (isLeft(argsEither)) {
      throw new Error(PathReporter.report(argsEither).join('\n'))
    }

    const args = argsEither.right

    if (isYarnMaintainCLIHelpArgs(args)) {
      console.log(`
Usage: yarn-maintain [flags]

Options: 

  -m, --module, --modules    Comma seperated list of module names to remove from lock file 
`)
      return
    }

    const newLockfileString = yarnMaintain({
      ...toYarnMaintainParams(args),
      lockfileString: await fs.readFile('yarn.lock', 'utf8'),
    })

    await fs.writeFile('yarn.lock', newLockfileString)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
  }
})()
