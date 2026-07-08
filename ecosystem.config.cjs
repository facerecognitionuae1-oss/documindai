module.exports = {
  apps: [
    {
      name: "documindai",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000
      },
      max_memory_restart: "750M",
      watch: false
    }
  ]
};
