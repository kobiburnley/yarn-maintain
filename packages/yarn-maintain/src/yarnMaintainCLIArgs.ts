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

const stringOrArray = orArray(optional(t.string))

export const yarnMaintainCLIArgs = t.type(
  {
    h: t.undefined,
    help: t.undefined,
    m: stringOrArray,
    module: stringOrArray,
    modules: stringOrArray,

    f: stringOrArray,
    filter: stringOrArray,
    filters: stringOrArray,

    s: stringOrArray,
    scope: stringOrArray,
    scopes: stringOrArray,
  },
  'YarnMaintainCLIArgs',
)

function flatOrArrayCommaString(a: t.TypeOf<typeof stringOrArray>) {
  return Array.isArray(a)
    ? a.flatMap((s) => s?.split(',') ?? [])
    : a?.split(',') ?? []
}

export function toYarnMaintainParams(
  args: t.TypeOf<typeof yarnMaintainCLIArgs>,
) {
  const { m, module, modules, f, filter, filters, s, scope, scopes } = args
  return {
    modules: [m, module, modules].flatMap(flatOrArrayCommaString),
    filters: [f, filter, filters].flatMap(flatOrArrayCommaString),
    scopes: [s, scope, scopes].flatMap(flatOrArrayCommaString),
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
