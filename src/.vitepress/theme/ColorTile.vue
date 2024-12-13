<script setup>
const props = defineProps(['color'])
</script>

<template>
    <div class="color-tile" :style="{ backgroundColor: props.color }"></div>
</template>

<style>
.color-tile {
  display: inline-block;
  width: 25px;
  height: 25px;
  border-radius: 5px;
}
</style>
