export const suggestMdiIcon = (
  title = "",
  route = "",
  group = ""
) => {
  const text =
    `${title} ${route} ${group}`.toLowerCase();

  const rules = [
    {
      keywords: ["teacher"],
      icon: "mdi-account-tie",
    },
    {
      keywords: ["student"],
      icon: "mdi-account-school",
    },
    {
      keywords: ["user"],
      icon: "mdi-account-group",
    },
    {
      keywords: ["role"],
      icon: "mdi-shield-account",
    },
    {
      keywords: ["permission"],
      icon: "mdi-shield-check",
    },
    {
      keywords: ["security"],
      icon: "mdi-security",
    },
    {
      keywords: ["audit"],
      icon: "mdi-file-search",
    },
    {
      keywords: ["device"],
      icon: "mdi-cellphone-link",
    },
    {
      keywords: ["holiday"],
      icon: "mdi-calendar-clock",
    },
    {
      keywords: ["dashboard"],
      icon: "mdi-view-dashboard",
    },
    {
      keywords: ["question"],
      icon: "mdi-help-box-multiple",
    },
    {
      keywords: ["paper"],
      icon: "mdi-file-document-multiple",
    },
    {
      keywords: ["exam"],
      icon: "mdi-file-check",
    },
    {
      keywords: ["portion"],
      icon: "mdi-book-check",
    },
    {
      keywords: ["lesson"],
      icon: "mdi-book-education",
    },
    {
      keywords: ["subject"],
      icon: "mdi-book-open-page-variant",
    },
    {
      keywords: ["grade"],
      icon: "mdi-google-classroom",
    },
    {
      keywords: ["analytics"],
      icon: "mdi-chart-line",
    },
    {
      keywords: ["report"],
      icon: "mdi-chart-box",
    },
    {
      keywords: ["notification"],
      icon: "mdi-bell",
    },
    {
      keywords: ["route"],
      icon: "mdi-routes",
    },
    {
      keywords: ["sidebar"],
      icon: "mdi-menu",
    },
  ];

  const match = rules.find((rule) =>
    rule.keywords.some((keyword) =>
      text.includes(keyword)
    )
  );

  return match?.icon || "mdi-circle-outline";
};