module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'tsx server.ts',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
