<template style="z-index:101">
  <k-status>
    <span class="upgrade-tips" v-if="tipVisible" @click="showDialog">
      <el-icon v-show="!old" class="is-loading">
        <Loading />
      </el-icon>
      {{ tipContext }}
    </span>
  </k-status>
  <el-dialog v-model="dialogVisible" class="dialog" :append-to-body="true">
    <template #header="{ close, titleId, titleClass }">
      <span :id="titleId" :class="titleClass">⭐我们发现了一份更新</span>
    </template>
    <h1 style="margin: 0;">{{ updata.name }} v{{ updata.latest }}</h1>
    <div class="markdown" v-if="changelog" v-html="changelog"></div>
    <div v-else>不对劲！似乎获取不到更新日志，但能确定这是新的，要升级吗？</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">再想想</el-button>
        <el-button type="primary" @click="install" :loading="upLoading">
          <span v-if="!upLoading">👍即刻升级</span>
          <span v-else>正在更新...</span>
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onUpdated, onMounted, onBeforeUnmount } from 'vue'
import { send } from '@koishijs/client'
import { ElLoading } from 'element-plus'
import Loading from './icons/loading.vue'
import { compare } from './utils'
import { UpgradeData } from '.'

const dialogVisible = ref(false)
const upLoading = ref(false)

const tipVisible = ref(true)
const tipContext = ref('正在查找更新...')
const updata = ref<UpgradeData>()
const changelog = ref<string>()

const old = ref(false)
let upgradeData: UpgradeData
let polling

onMounted(() => send('upgrade/latest', 'koishi').then(setData))
onUpdated(() => send('upgrade/latest', 'koishi').then(setData))

function setData(data: UpgradeData) {
  if (compare(data.latest, data.version) > 0) {
    updata.value = data
    old.value = true
    tipContext.value = `你的 ${data.name} 该升级了`
    send('upgrade/markd', data.changelog, navigator.userAgent)
      .then(html => {
        changelog.value = html
      })
  } else {
    tipVisible.value = false
    old.value = false
  }
}

const showDialog = () => {
  if (old) {
    dialogVisible.value = true
  }
}

const install = () => {
  upLoading.value = true
  const loading = ElLoading.service({
    lock: true,
    text: `你的 ${updata.value.name} 正在升级...`,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  setTimeout(() => {
    loading.setText('等待 Koishi 重启...')
    loading.background.value = 'rgba(0, 0, 0, 0.95)'
  }, 5000)
  send('upgrade/install', {
    [updata.value.name]: updata.value.latest
  })
  polling = setInterval(() => {
    fetch('/api/upgrade/status')
      .then(res => res.json())
      .then(data => {
        if (data.alive) {
          loading.close()
          clearInterval(polling)
          window.location.reload()
        }
      })
  }, 5000)
}
</script>

<style scoped>
.markdown {
  padding: 0;
  max-height: 40vh;
  overflow: auto;
}

.upgrade-tips {
  display: flex;
  align-items: center;
}
</style>
