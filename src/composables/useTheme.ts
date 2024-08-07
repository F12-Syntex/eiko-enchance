import { ref } from 'vue';

const isDarkMode = ref(true);

export function useTheme() {
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  return { isDarkMode, toggleTheme };
}