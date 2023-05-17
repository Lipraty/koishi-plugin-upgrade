import { Context, Plugin, Schema, version } from 'koishi'
import { DataService } from '@koishijs/plugin-console'
import { } from '@koishijs/plugin-market'
import { resolve } from 'node:path'
import which from 'which-pm-runs'
import { Latest } from './types'

declare module '@koishijs/plugin-console' {
  namespace Console {
    interface Services {
      upgrade: UpgradeData
    }
  }
  interface Events {
    'upgrader'(target: string): void
  }
}

export const name = 'upgrade'

export const usage = `
这里空空如也，也许你应该看看左下角有没有 Koishi 更新。
`

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export interface UpgradeData {
  version: string,
  latest: string,
  changelog: string
}

class UpgradeProvider extends DataService<UpgradeData> {
  static using = ['console.dependencies'] as const
  constructor(ctx: Context, private config: Config) {
    super(ctx, 'upgrade')

    ctx.console.addListener('upgrader', async (target: string) => {
      return this.upgradeKoishi(ctx, target)
    })
  }

  async upgradeKoishi(ctx: Context, target: string) {
    const installer = ctx.console.dependencies
    await installer.override({
      'koishi': target,
    })
    const args: string[] = []
    const agent = which().name || 'npm'
    if (agent !== 'yarn') {
      args.push('install')
    }
    args.push('--registry', installer.registry)
    await installer.exec(agent, args)
    ctx.loader.fullReload()
  }

  async get(): Promise<UpgradeData> {
    const release = await this.ctx.http<Latest>('GET', 'https://api.github.com/repos/koishijs/koishi/releases/latest')
    const latest = release.tag_name
    const changelog = release.body
    return { version, latest, changelog }
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.plugin(UpgradeProvider, config)
  ctx.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })
  })
}
