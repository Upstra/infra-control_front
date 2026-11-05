<template>
  <div class="resource-list">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-lg font-semibold text-text-strong">
          {{ title }}
        </h3>
        <p class="text-sm text-text-muted mt-1">
          {{ $t('setup.resource_list.count', { count: items.length }) }}
        </p>
      </div>
      <button
        @click="$emit('add')"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {{ addButtonText || $t('setup.resource_list.add_new') }}
      </button>
    </div>

    <div
      v-if="items.length === 0"
      class="text-center py-12 bg-surface-sunken rounded-lg"
    >
      <svg
        class="mx-auto h-12 w-12 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-text-strong">
        {{ emptyStateTitle || $t('setup.resource_list.no_items') }}
      </h3>
      <p class="mt-1 text-sm text-text-muted">
        {{ emptyStateDescription || $t('setup.resource_list.get_started') }}
      </p>
      <div class="mt-6">
        <button
          @click="$emit('add')"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {{ addButtonText || $t('setup.resource_list.add_first') }}
        </button>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        class="bg-surface shadow rounded-lg p-4 transition-all hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <slot name="item" :item="item" :index="index">
              <h4
                class="text-sm font-medium text-text-strong truncate"
              >
                {{ item.name || `${itemType} ${index + 1}` }}
              </h4>
              <p
                v-if="item.description"
                class="mt-1 text-sm text-text-muted"
              >
                {{ item.description }}
              </p>
            </slot>
          </div>

          <div class="ml-4 flex items-center space-x-2">
            <button
              v-if="showDuplicate"
              @click="$emit('duplicate', item.id || index)"
              class="text-text-muted hover:text-text-muted"
              :title="$t('setup.resource_list.duplicate')"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>

            <button
              @click="$emit('edit', item.id || index)"
              class="text-text-muted hover:text-text-muted"
              :title="$t('setup.resource_list.edit')"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              @click="$emit('delete', item.id || index)"
              class="text-danger-text hover:text-danger-text"
              :title="$t('setup.resource_list.delete')"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="showStatus && item.status" class="mt-3">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="{
              'bg-success-surface text-success-text':
                item.status === 'active' || item.status === 'connected',
              'bg-warning-surface text-warning-text':
                item.status === 'pending',
              'bg-danger-surface text-danger-text':
                item.status === 'error' || item.status === 'disconnected',
              'bg-surface-raised text-text-strong':
                ![
                  'active',
                  'connected',
                  'pending',
                  'error',
                  'disconnected',
                ].includes(item.status),
            }"
          >
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="showBulkActions" class="mt-6 flex justify-between items-center">
      <div class="flex space-x-2">
        <button
          @click="$emit('import')"
          class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {{ $t('setup.resource_list.import') }}
        </button>

        <button
          @click="$emit('export')"
          :disabled="items.length === 0"
          class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          {{ $t('setup.resource_list.export') }}
        </button>

        <button
          v-if="items.length > 0"
          @click="$emit('clearAll')"
          class="inline-flex items-center px-4 py-2 border border-danger-border shadow-sm text-sm font-medium rounded-md text-danger-text bg-surface hover:bg-danger-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {{ $t('setup.resource_list.clear_all') }}
        </button>
      </div>

      <button
        v-if="showApplyTemplate"
        @click="$emit('applyTemplate')"
        class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        {{ $t('setup.resource_list.apply_template') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  items: any[];
  itemType?: string;
  addButtonText?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showDuplicate?: boolean;
  showStatus?: boolean;
  showBulkActions?: boolean;
  showApplyTemplate?: boolean;
}

withDefaults(defineProps<Props>(), {
  itemType: 'Item',
  showDuplicate: true,
  showStatus: false,
  showBulkActions: false,
  showApplyTemplate: false,
});

defineEmits<{
  add: [];
  edit: [id: string | number];
  delete: [id: string | number];
  duplicate: [id: string | number];
  import: [];
  export: [];
  applyTemplate: [];
  clearAll: [];
}>();
</script>
