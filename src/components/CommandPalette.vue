<template>
  <div>
    <button @click="isOpen = true" class="hidden" ref="trigger" />
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4">
        <div class="bg-white w-full max-w-xl rounded-xl shadow-xl p-4 mt-20">
          <div class="flex items-center justify-between">
            <input v-model="query" type="text" placeholder="Que voulez-vous faire ?"
              class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <span class="ml-4 px-2 py-1 bg-neutral-100 rounded text-sm text-neutral-500 cursor-pointer"
              @click="closeCommandPalette()">Esc</span>
          </div>

          <ul class="mt-4 space-y-2 max-h-96 overflow-y-auto">
            <template v-for="(grouped, group) in groupedActions" :key="group">
              <li class="text-xs text-neutral-400 uppercase px-3 mt-2">{{ group }}</li>
              <li v-for="action in grouped" :key="action.label"
                class="flex items-center justify-between gap-4 p-3 hover:bg-neutral-100 rounded cursor-pointer"
                @click="handleAction(action)">
                <div class="flex items-center gap-3">
                  <component :is="action.icon" class="w-5 h-5 text-neutral-600" />
                  <span>{{ action.label }}</span>
                </div>
                <kbd v-if="action.shortcut" class="text-xs px-2 py-1 bg-neutral-200 rounded">{{ action.shortcut }}</kbd>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { Server, Users, Group, Plug, Building, Boxes } from 'lucide-vue-next'
import { Cog6ToothIcon } from '@heroicons/vue/24/solid'
import { useRoute } from 'vue-router'

const isOpen = ref(false)
const query = ref('')

const emit = defineEmits(['switchView'])

const route = useRoute()

const actions = [
  { group: 'Utilisateurs', label: 'Afficher les utilisateurs', icon: Users, fn: () => navigateTo('/users'), shortcut: 'U', path: '/users' },
  { group: 'Utilisateurs', label: 'Vue tableau', icon: Boxes, fn: () => emit('switchView', 'table'), onlyInUsers: true },
  { group: 'Utilisateurs', label: 'Vue cartes', icon: Group, fn: () => emit('switchView', 'card'), onlyInUsers: true },
  { group: 'Serveurs', label: 'Créer un serveur', icon: Server, fn: () => navigateTo('/servers/create'), shortcut: 'S', path: '/servers/create' },
  { group: 'Infrastructure', label: 'Créer un onduleur', icon: Plug, fn: () => navigateTo('/ups/create'), shortcut: 'O', path: '/ups/create' },
  { group: 'Infrastructure', label: 'Créer une salle', icon: Building, fn: () => navigateTo('/rooms/create'), shortcut: 'R', path: '/rooms/create' },
  { group: 'Serveurs', label: 'Voir les logs', icon: Server, fn: () => navigateTo('/logs'), path: '/logs' },
  { group: 'Général', label: 'Voir les paramètres', icon: Cog6ToothIcon, fn: () => navigateTo('/settings'), path: '/settings' },
  { group: 'Général', label: 'Basculer la vue sombre', icon: Plug, fn: () => toggleDarkMode(), shortcut: 'T' },
  { group: 'Général', label: 'Se déconnecter', icon: Building, fn: () => logout() },
]



const groupedActions = computed(() => {
  return actions
    .filter(action => {
      if (action.onlyInUsers && !route.path.startsWith('/users')) return false
      if ('path' in action && route.path === action.path) return false
      return action.label.toLowerCase().includes(query.value.toLowerCase())
    })
    .reduce((acc, action) => {
      acc[action.group] = acc[action.group] || []
      acc[action.group].push(action)
      return acc
    }, {} as Record<string, typeof actions>)
})

const handleAction = (action: { label: string, fn: () => void }) => {
  action.fn()
  isOpen.value = false
  query.value = ''
}

const closeCommandPalette = () => {
  isOpen.value = false
  query.value = ''
}

const { ctrl_k, meta_k, escape } = useMagicKeys()
onMounted(() => {
  watch([ctrl_k, meta_k], ([ctrl, meta]) => {
    if (ctrl || meta) isOpen.value = true
  })
  watch(escape, v => {
    if (v) isOpen.value = false
  })
})

function navigateTo(path: string) {
  window.location.href = path
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark')
}

function logout() {
  window.location.href = '/login'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

kbd {
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid #ccc;
}
</style>