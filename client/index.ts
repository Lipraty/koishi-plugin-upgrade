import { Context } from '@koishijs/client'
import Tip from './tip.vue'

export default (ctx: Context) => {
    ctx.slot({
        type: 'status-left',
        component: Tip
    })
}
