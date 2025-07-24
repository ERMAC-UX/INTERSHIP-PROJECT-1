import os

# Bind to the port provided by Render
bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"

# Worker configuration
workers = 2
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100

# Timeout configuration
timeout = 120
keepalive = 5

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Process naming
proc_name = "cti-dashboard-backend"

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
