<template style="z-index:101">
  <k-status>
    <span v-if="tipVisible" @click="dialogVisible = !dialogVisible">你的 Koishi 该更新了</span>
  </k-status>
  <el-dialog v-model="dialogVisible" class="dialog" :append-to-body="true">
    <template #header="{ close, titleId, titleClass }">
      <span :id="titleId" :class="titleClass">⭐我们发现了一份更新</span>
      <h2 style="margin: 0;">Koishi v{{ upgradeData.latest }}</h2>
    </template>
    <div class="markdown" v-if="changelog" v-html="changelog"></div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">再想想</el-button>
        <el-button type="primary" @click="upgrader" :loading="upLoading">
          <span v-if="!upLoading">👍即刻升级</span>
          <span v-else>正在更新...</span>
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { send, store } from '@koishijs/client'
import { ElLoading } from 'element-plus'
import { compare } from './utils'

const upgradeData = store.upgrade
const tipVisible = compare(upgradeData.version, upgradeData.latest) > 0
const dialogVisible = ref(false)
const upLoading = ref(false)
const changelog = ref<string>()

const upgrader = () => {
  upLoading.value = true
  const loading = ElLoading.service({
    lock: true,
    text: '你的 Koishi 正在升级...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  send('upgrader', upgradeData.latest)
}
if (tipVisible) send('gfmark', upgradeData.changelog, navigator.userAgent)
  .then(html => {
    changelog.value = html
  })
</script>

<style scoped>
.markdown {
  padding: 0;
  margin-top: -20px;
  max-height: 40vh;
  overflow: auto;

}
</style>
