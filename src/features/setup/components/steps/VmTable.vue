<template>
  <table
    class="w-full mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-neutral-800"
  >
    <thead
      class="bg-neutral-light dark:bg-neutral-700 text-neutral-dark dark:text-neutral-300 text-sm"
    >
      <tr>
        <th class="p-3 font-semibold text-left dark:text-neutral-300">
          {{ t('vm_table.name') }}
        </th>
        <th class="p-3 font-semibold text-left dark:text-neutral-300">
          {{ t('vm_table.ip') }}
        </th>
        <th class="p-3 font-semibold text-left dark:text-neutral-300">
          {{ t('vm_table.state') }}
        </th>
        <th class="p-3"></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="vm in vms"
        :key="vm.id"
        class="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700 group"
      >
        <td class="p-3 font-mono text-base text-neutral-darker dark:text-white">
          {{ vm.name }}
        </td>
        <td
          class="p-3 font-mono text-sm text-neutral-dark dark:text-neutral-300"
        >
          {{ vm.ip }}
        </td>
        <td class="p-3">
          <span
            :class="
              vm.state === 'active'
                ? 'bg-success text-white'
                : 'bg-danger text-white'
            "
            class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider dark:text-white"
          >
            {{
              vm.state === 'active'
                ? t('vm_table.active')
                : t('vm_table.inactive')
            }}
          </span>
        </td>
        <td class="p-3 text-right">
          <button
            @click="$emit('edit', vm)"
            class="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-dark dark:text-neutral-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary-dark dark:hover:text-primary font-semibold text-xs transition"
          >
            {{ t('vm_table.rename') }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ vms: any[] }>();
const { t } = useI18n();
</script>
