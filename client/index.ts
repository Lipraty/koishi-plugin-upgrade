import { Context, icons } from '@koishijs/client'
import Tip from './tip.vue'
import Refresh from './icons/refresh.vue'

declare module '@koishijs/plugin-console' {
  namespace Console {
    interface Services {
      upgrade: UpgradeData
    }
  }
  interface Events {
    'upgrade/install'(deps: Record<string, string>): void
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

icons.register('refresh', Refresh)

export default (ctx: Context) => {
  ctx.slot({
    type: 'status-left',
    component: Tip
  })
}
