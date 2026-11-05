<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DashboardTabs from '../components/board/DashboardTabs.vue';
import BoardEditBar from '../components/board/BoardEditBar.vue';
import BoardGrid from '../components/board/BoardGrid.vue';
import BoardEmpty from '../components/board/BoardEmpty.vue';
import WidgetCatalog from '../components/board/WidgetCatalog.vue';
import ErrorAlert from '@/shared/components/ErrorAlert.vue';
import { useDashboardBoard } from '../composables/useDashboardBoard';

const { t } = useI18n();
const {
  store,
  editor,
  board,
  catalogOpen,
  saving,
  canDelete,
  select,
  customize,
  create,
  cancel,
  save,
  remove,
  add,
  openCatalog,
} = useDashboardBoard();
</script>

<template>
  <div class="flex flex-col gap-6">
    <DashboardTabs
      :boards="store.boards"
      :active-id="store.active?.id ?? null"
      :editing="editor.editing.value"
      @select="select"
      @create="create"
      @customize="customize"
    />
    <ErrorAlert
      v-if="store.error && !store.boards.length"
      :message="t('boards.load_error')"
    />
    <BoardEditBar
      v-if="editor.editing.value && board"
      :name="board.name"
      :can-delete="canDelete"
      :saving="saving"
      @rename="editor.rename"
      @add="openCatalog"
      @delete="remove"
      @cancel="cancel"
      @save="save"
    />
    <template v-if="board">
      <BoardEmpty v-if="!board.widgets.length" @add="openCatalog" />
      <BoardGrid
        v-else
        :widgets="board.widgets"
        :editing="editor.editing.value"
        @reorder="editor.reorder"
        @move="editor.move"
        @resize="editor.resize"
        @remove="editor.removeWidget"
      />
    </template>
    <WidgetCatalog
      :open="catalogOpen"
      :board-name="board?.name ?? ''"
      :present="editor.present.value"
      @close="catalogOpen = false"
      @add="add"
    />
  </div>
</template>
