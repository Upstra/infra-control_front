import { ref } from 'vue'

const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
const visible = ref(false)

export function useToaster() {
    const showToast = (msg: string, toastType: typeof type.value = 'info') => {
        message.value = msg
        type.value = toastType
        visible.value = true

        setTimeout(() => {
            visible.value = false
        }, 2500)
    }

    return {
        showToast,
        message,
        type,
        visible,
    }
}