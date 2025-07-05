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
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
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
      <span class="text-gray-500 dark:text-gray-400">
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
  inputClass: 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white',
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
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  {
    label: 'High',
    value: 100,
    min: 100,
    max: 299,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  {
    label: 'Medium',
    value: 300,
    min: 300,
    max: 599,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  {
    label: 'Low',
    value: 600,
    min: 600,
    max: 999,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
];

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue;
});

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