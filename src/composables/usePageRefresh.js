import { watch } from "vue";
import { useAppStore } from "../stores/app";

export function usePageRefresh(loadData) {
  const appStore = useAppStore();

  watch(
    () => appStore.refreshKey,
    async () => {
      await loadData();
    }
  );
}