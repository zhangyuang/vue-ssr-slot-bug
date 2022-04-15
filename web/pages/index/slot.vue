<template>
  <slot>
    {{ title }}
  </slot>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'

const props = defineProps<{
  title?: string,
}>()
const title = ref(props.title)
</script>
