import { ref } from "vue";

export function usePasswordToggle(
  defaultType: "password" | "text" = "password"
) {
  const fieldType = ref<"password" | "text">(defaultType);
  const toggle = () => {
    fieldType.value = fieldType.value === "password" ? "text" : "password";
  };
  return { fieldType, toggle };
}
