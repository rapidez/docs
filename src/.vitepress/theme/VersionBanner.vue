<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import { getVersionFromPath, isOldVersion as checkOldVersion } from '../versions.mjs'

const { page } = useData()

const currentVersion = computed(() => getVersionFromPath(page.value.relativePath))
// On a 404 the relativePath is the requested url, but the layout doesn't get the
// old-version-page class from transformPageData, so the banner would cover the nav.
const isOldVersion = computed(() => !page.value.isNotFound && checkOldVersion(page.value.relativePath))
</script>

<template>
  <div v-if="isOldVersion" class="version-banner">
    ⚠ Older version ({{ currentVersion }}) — see
    <a href="https://rapidez.io/versions" target="_blank" rel="noopener">rapidez.io/versions</a>
    for supported versions.
  </div>
</template>

<style scoped>
.version-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-layout-top);
  box-sizing: border-box;
  padding: 10px 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  background-color: #c2410c;
  color: #fff;
}

.version-banner a {
  color: #fff;
  font-weight: 700;
  text-decoration: underline;
}
</style>
