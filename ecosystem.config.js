module.exports = {
  apps: [
    {
      name: 'shiftmanager2',
      script: 'start.js',
      cwd: __dirname,
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      min_uptime: '10s',
      max_restarts: 5
    }
  ]
}
