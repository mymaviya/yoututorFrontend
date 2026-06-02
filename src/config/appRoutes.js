import router from "../router";

export const getFrontendRoutes = () => {
  return router
    .getRoutes()
    .filter((route) => route.name)
    .map((route) => ({
      title: route.meta?.title || route.name,
      name: route.name,
      path: route.path,
    }))
    .sort((a, b) => String(a.title).localeCompare(String(b.title)));
};

