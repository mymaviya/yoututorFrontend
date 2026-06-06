export const groupIcons = {
  Academic: "mdi-school",
  Teachers: "mdi-account-tie",
  "Question Bank": "mdi-help-box-multiple",
  Papers: "mdi-file-document-multiple",
  "Question Papers": "mdi-file-document-multiple",
  Reports: "mdi-chart-box",
  Examinations: "mdi-laptop",
  Administration: "mdi-account-cog",
  Security: "mdi-shield-check",
  Manage: "mdi-cogs",
  Imports: "mdi-file-import",
};

export function buildSidebarMenus(menus = [], badgeCounts = {}) {
  const groups = {};
  const singleItems = [];

  menus
    .filter((menu) => menu.is_active && menu.show_in_sidebar !== false)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .forEach((menu) => {
      const dynamicBadge = badgeCounts[menu.route_name];

      const item = {
        title: menu.title,
        icon: menu.icon || "mdi-circle-small",
        routeName: menu.route_name,
        permission: menu.permission_slug,
        order: Number(menu.sort_order || 0),

        badge:
          dynamicBadge !== undefined && dynamicBadge !== null && dynamicBadge !== 0
            ? dynamicBadge
            : menu.badge || null,

        badgeColor:
          dynamicBadge !== undefined && dynamicBadge !== null && dynamicBadge !== 0
            ? "error"
            : menu.badge_color || "primary",
      };

      if (!menu.group_name) {
        singleItems.push(item);
        return;
      }

      if (!groups[menu.group_name]) {
        groups[menu.group_name] = {
          title: menu.group_name,
          icon: groupIcons[menu.group_name] || "mdi-folder-outline",
          order: Number(menu.sort_order || 0),
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