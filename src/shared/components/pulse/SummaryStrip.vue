<script setup lang="ts">
export interface SummaryCell {
  key: string;
  label: string;
  value: string;
  suffix?: string | null;
  accent: string;
  tone?: string;
}

defineProps<{ cells: SummaryCell[]; label: string }>();
</script>

<template>
  <section
    :aria-label="label"
    class="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] overflow-hidden rounded-lg border border-border bg-surface shadow-sm tnum"
  >
    <div
      v-for="cell in cells"
      :key="cell.key"
      :class="[
        'flex flex-col gap-1.5 border-r border-surface-raised px-[22px] py-[18px]',
        cell.tone,
      ]"
      :data-summary="cell.key"
    >
      <span
        class="flex items-center gap-2 font-mono text-overline text-text-muted"
      >
        <span :class="['h-2 w-2 rounded-[2px]', cell.accent]" />{{ cell.label }}
      </span>
      <span class="flex flex-wrap items-baseline gap-x-1.5">
        <span
          :class="[
            'font-mono text-[28px] font-light leading-8 tracking-[-0.02em]',
            cell.tone ? '' : 'text-text-strong',
          ]"
          data-part="value"
          >{{ cell.value }}</span
        >
        <span v-if="cell.suffix" class="text-[13px] text-text-muted">{{
          cell.suffix
        }}</span>
      </span>
    </div>
  </section>
</template>
