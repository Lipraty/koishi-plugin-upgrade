import { Context, Plugin, Schema, version as kVersion } from 'koishi'
import { version as pVersion } from '../package.json'
import { DataService } from '@koishijs/plugin-console'
import { } from '@koishijs/plugin-market'
import { resolve } from 'node:path'
import which from 'which-pm-runs'
import { Latest } from './types'
import { Dict } from 'koishi'

declare module '@koishijs/plugin-console' {
  namespace Console {
    interface Services {
      upgrade: UpgradeData
    }
  }
  interface Events {
    'upgrade/install'(deps: Dict<string>): void
    'upgrade/markd'(text: string, ua: string): Promise<string>
    'upgrade/latest'(name: string): Promise<UpgradeData>
  }
}

export interface UpgradeData {
  name: string
  version: string,
  latest: string,
  changelog: string
}

const verMap = {
  koishi: kVersion,
  upgrade: pVersion
}

export const name = 'upgrade'

export const usage = `
这里空空如也，也许你应该看看左下角有没有 Koishi 更新。

如果你在日志中看到了 Timeout 的报错，也许你应该为你的 Koishi 配置一个代理。
`

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

class UpgradeProvider extends DataService<UpgradeData> {
  static using = ['console.dependencies'] as const
  constructor(ctx: Context, private config: Config) {
    super(ctx, 'upgrade')

    ctx.console.addListener('upgrade/install', async (deps: Dict<string>) => {
      return this.upgradeDeps(ctx, deps)
    })

    ctx.console.addListener('upgrade/latest', async (name): Promise<UpgradeData> => {
      const release = await this.ctx.http<Latest>('GET', 'https://api.github.com/repos/koishijs/koishi/releases/latest')
      const latest = release.tag_name
      const changelog = release.body
      return { name, latest, changelog, version: verMap[name] }
    })

    ctx.console.addListener('upgrade/markd',
      async (text: string, ua: string) => await ctx.http<string>('POST', 'https://api.github.com/markdown', {
        headers: { 'user-agent': ua },
        data: {
          mode: 'gfm',
          text
        }
      })
    )
  }

  getVersion(name: string) { }

  async upgradeDeps(ctx: Context, deps: Dict<string>) {
    const installer = ctx.console.dependencies
    await installer.override(deps)
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
    return
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
