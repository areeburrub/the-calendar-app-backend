module.exports = {
  apps: [
    {
      name: "the-calendar-app-backend",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
