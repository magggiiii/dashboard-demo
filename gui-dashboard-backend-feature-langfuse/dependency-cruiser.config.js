// gui-dashboard-backend-feature-langfuse/dependency-cruiser.config.js
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "warn",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
  },
};
