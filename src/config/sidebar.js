export const groupIcons = {
  Teachers: "mdi-account-tie",
  "Question Bank": "mdi-help-box-multiple",
  "Question Papers": "mdi-file-document-multiple",

  Administration: "mdi-account-cog",
  Security: "mdi-shield-check",
  Manage: "mdi-cogs",
  Exams: "mdi-laptop",
};

export function buildSidebarMenus(menus = []) {
  const groups = {};
  const singleItems = [];

  menus
    .filter((menu) => menu.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((menu) => {
      const item = {
        title: menu.title,
        icon: menu.icon || "mdi-circle-small",
        routeName: menu.route_name,
        permission: menu.permission_slug,
        order: menu.sort_order,
      };

      if (!menu.group_name) {
        singleItems.push(item);
        return;
      }

      if (!groups[menu.group_name]) {
        groups[menu.group_name] = {
          title: menu.group_name,
          icon: groupIcons[menu.group_name] || "mdi-folder-outline",
          order: menu.sort_order,
          children: [],
        };
      }

      groups[menu.group_name].children.push(item);
    });

  return [
    ...singleItems,
    ...Object.values(groups).map((group) => ({
      ...group,
      children: group.children.sort((a, b) => a.order - b.order),
    })),
  ].sort((a, b) => a.order - b.order);
}