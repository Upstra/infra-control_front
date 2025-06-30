<script setup lang="ts">
import TwoFAForm from '../components/TwoFAForm.vue';
import { handle2FASuccess } from '@/router';
</script>

<template>
  <div class="flex justify-center px-4 py-20 bg-neutral-light">
    <TwoFAForm @success="handle2FASuccess" />
  </div>
</template>
