import { defineStore } from "pinia";

export const usePermissionStore = defineStore(
  "permission",
  {
    state: () => ({
      permissions: [],
    }),

    actions: {
      can(permission) {
        return this.permissions.includes(permission);
      },
    },
  },
);