<template>
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <input
        :id="inputId"
        v-model.number="internalValue"
        type="number"
        :min="1"
        :max="999"
        :class="inputClass"
        :required="required"
        :disabled="disabled"
        @input="handleInput"
        class="block w-full border rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
      />
      <div v-if="showPresets" class="flex gap-1">
        <button
          v-for="preset in presets"
          :key="preset.value"
          type="button"
          @click="setPreset(preset.value)"
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition',
            internalValue >= preset.min && internalValue <= preset.max
              ? preset.color
              : 'bg-surface-raised text-text hover:bg-surface-raised',
          ]"
          :title="`${preset.label}: ${preset.min}-${preset.max}`"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
    <div class="flex items-center justify-between text-xs">
      <span :class="['font-medium', getPriorityColor(internalValue)]">
        {{ getPriorityLabel(internalValue) }} ({{ internalValue }})
      </span>
      <span class="text-text-muted">
        {{ hint }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getPriorityColor, getPriorityLabel } from '../utils/priority-utils';

interface Props {
  modelValue: number;
  inputId?: string;
  inputClass?: string;
  required?: boolean;
  disabled?: boolean;
  showPresets?: boolean;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  inputId: 'priority',
  inputClass:
    'border-border-control bg-surface text-text-strong',
  required: false,
  disabled: false,
  showPresets: true,
  hint: '1 = shuts down first, 999 = shuts down last',
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const internalValue = ref(props.modelValue);

const presets = [
  {
    label: 'Critical',
    value: 1,
    min: 1,
    max: 99,
    color: 'bg-danger-surface text-danger-text',
  },
  {
    label: 'High',
    value: 100,
    min: 100,
    max: 299,
    color:
      'bg-warning-surface text-warning-text',
  },
  {
    label: 'Medium',
    value: 300,
    min: 300,
    max: 599,
    color:
      'bg-warning-surface text-warning-text',
  },
  {
    label: 'Low',
    value: 600,
    min: 600,
    max: 999,
    color: 'bg-success-surface text-success-text',
  },
];

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  },
);

const handleInput = () => {
  if (internalValue.value < 1) internalValue.value = 1;
  if (internalValue.value > 999) internalValue.value = 999;
  emit('update:modelValue', internalValue.value);
};

const setPreset = (value: number) => {
  internalValue.value = value;
  emit('update:modelValue', value);
};
</script>
