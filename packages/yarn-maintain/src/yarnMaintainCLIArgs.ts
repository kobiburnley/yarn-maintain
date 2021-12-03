import * as t from 'io-ts'

const optional = <T extends t.Mixed>(codec: T) =>
  t.union([codec, t.undefined, t.null], 'Optional')

const orArray = <T extends t.Mixed>(codec: T) =>
  t.union([codec, t.array(codec)], 'OrArray')

export const yarnMaintainCLIHelpArgs = t.union(
  [
    t.type({ h: t.boolean, help: t.undefined }),
    t.type({ help: t.boolean, h: t.undefined }),
  ],
  'YarnMaintainCLIArgs',
)

export const yarnMaintainCLIArgs = t.type(
  {
    h: t.undefined,
    help: t.undefined,
    m: orArray(optional(t.string)),
    module: orArray(optional(t.string)),
    modules: orArray(optional(t.string)),
  },
  'YarnMaintainCLIArgs',
)

export function toYarnMaintainParams({
  m,
  module,
  modules,
}: t.TypeOf<typeof yarnMaintainCLIArgs>) {
  return {
    modules: [m, module, modules].flatMap((a) =>
      Array.isArray(a)
        ? a.flatMap((s) => s?.split(',') ?? [])
        : a?.split(',') ?? [],
    ),
  }
}

export const yarnMaintainCLIArgsOrHelp = t.union(
  [yarnMaintainCLIArgs, yarnMaintainCLIHelpArgs],
  'YarnMaintainCLIArgsOrHelp',
)

export const isYarnMaintainCLIHelpArgs = (
  args: t.TypeOf<typeof yarnMaintainCLIArgsOrHelp>,
): args is t.TypeOf<typeof yarnMaintainCLIHelpArgs> =>
  args.h != null || args.help != null
