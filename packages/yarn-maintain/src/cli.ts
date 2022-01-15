import minimist from 'minimist'
import {
  isYarnMaintainCLIHelpArgs,
  toYarnMaintainParams,
  yarnMaintainCLIArgsOrHelp,
} from './yarnMaintainCLIArgs'
import { isLeft } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

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

  -m, --module, --modules    Comma seperated list of module names 
  -f, --filter, --filter     Comma seperated list of regex patterns 
  -s, --scope, --scopes      Comma seperated list of package scopes
`)
      return
    }

    await yarnMaintain({
      ...toYarnMaintainParams(args),
    })
  } catch (e) {
    console.error(e)
    process.exitCode = 1
  }
})()
