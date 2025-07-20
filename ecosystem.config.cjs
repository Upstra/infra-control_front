module.exports = {
  apps: [{
    name: 'upstra-frontend',
    script: './serve-prod.cjs',
    env: {
      PORT: 80,
      NODE_ENV: 'production'
    },
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    interpreter: 'node',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}