export const groupIcons = {
  Academic: "mdi-school",
  "Academic Planning": "mdi-calendar-school",
  Timetable: "mdi-calendar-clock",
  "Timetable Management": "mdi-calendar-multiple-check",
  "Timetable Setup": "mdi-calendar-cog",
  Teachers: "mdi-account-tie",
  "Question Bank": "mdi-help-box-multiple",
  Papers: "mdi-file-document-multiple",
  "Question Papers": "mdi-file-document-multiple",
  Reports: "mdi-chart-box",
  Examinations: "mdi-laptop",
  Administration: "mdi-account-cog",
  "School Management": "mdi-office-building-cog",
  "School Operations": "mdi-school-outline",
  Security: "mdi-shield-check",
  Manage: "mdi-cogs",
  Imports: "mdi-file-import",
};

const routeAliases = {
  "bell-schedules": "bell.schedules",
  "bell.schedule": "bell.schedules",
  "bell.schedule.index": "bell.schedules",
  "timetable-generator": "timetable.generator",
  "timetable.generator.index": "timetable.generator",
  "automatic.timetable.generator": "timetable.generator",
  "timetable-batch-generator": "timetable.batch-generator",
  "timetable.batch.generator": "timetable.batch-generator",
  "batch.timetable.generator": "timetable.batch-generator",
  "timetable-generation-runs": "timetable.batch-generator",
  "timetable.generation.history": "timetable.batch-generator",
  "weekly-timetables": "timetable.editor",
  "weekly.timetables": "timetable.editor",
  "timetable-editor": "timetable.editor",
  "timetable.editor.index": "timetable.editor",
  "timetable.lifecycle": "timetable.editor",
  "timetable-templates": "timetable.templates",
  "timetable-rules": "timetable.rules",
  "timetable-rooms": "timetable.rooms",
  "parallel-groups": "timetable.parallel-groups",
};

const normalizeRouteName = (routeName) => {
  if (!routeName) return null;
  return routeAliases[routeName] || routeName;
};

export function buildSidebarMenus(menus = [], badgeCounts = {}) {
  const groups = {};
  const singleItems = [];

  menus
    .filter((menu) => menu.is_active && menu.show_in_sidebar !== false)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .forEach((menu) => {
      const routeName = normalizeRouteName(menu.route_name);
      const dynamicBadge = badgeCounts[routeName] ?? badgeCounts[menu.route_name];

      const item = {
        title: menu.title,
        icon: menu.icon || "mdi-circle-small",
        routeName,
        permission: menu.permission_slug,
        featureKey: menu.feature_key || menu.featureKey || null,
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
