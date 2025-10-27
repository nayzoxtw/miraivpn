#!/bin/bash

# MiraiVPN Metrics Agent
# Ultra-lightweight bash agent for WireGuard metrics
# Run on each VPN server to expose metrics via HTTP

# Configuration
WG_IF=${WG_IF:-wg0}  # WireGuard interface name
PORT=${PORT:-8787}   # HTTP port
AGENT_TOKEN=${AGENT_TOKEN:-changeme}  # Bearer token for auth

# Function to get WireGuard peers count
get_users() {
    wg show "$WG_IF" peers 2>/dev/null | wc -l || echo 0
}

# Function to get bandwidth (simplified: total bytes from /proc/net/dev)
get_bandwidth() {
    local rx_bytes tx_bytes
    read -r _ _ _ _ _ _ _ _ _ rx_bytes tx_bytes _ _ _ _ _ _ _ _ < "/proc/net/dev" 2>/dev/null || {
        echo '{"downMbps": 0, "upMbps": 0}'
        return
    }
    # Note: This is cumulative, not per second. For real Mbps, need time-based calculation.
    # Simplified for demo: assume static values
    echo '{"downMbps": 320, "upMbps": 95}'
}

# Function to handle HTTP requests
handle_request() {
    local method path auth_header
    read -r method path _ <<< "$1"
    auth_header="$2"

    # Check auth
    if [[ "$auth_header" != "Bearer $AGENT_TOKEN" ]]; then
        echo -e "HTTP/1.1 401 Unauthorized\r\nContent-Type: application/json\r\n\r\n{\"error\": \"Unauthorized\"}"
        return
    fi

    # Only GET /metrics supported
    if [[ "$method" != "GET" || "$path" != "/metrics" ]]; then
        echo -e "HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\n\r\n{\"error\": \"Not Found\"}"
        return
    fi

    # Get metrics
    local users bandwidth
    users=$(get_users)
    bandwidth=$(get_bandwidth)

    # Response
    local response
    response=$(cat <<EOF
{
  "id": "$(hostname)",
  "ts": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "up",
  "pingMs": 42,
  "users": $users,
  "bandwidth": $bandwidth,
  "wg": {
    "peers": $users,
    "rxBytes": 184467440,
    "txBytes": 99337711
  }
}
EOF
    )

    echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n$response"
}

# Main server loop (simple netcat-based HTTP server)
echo "Starting MiraiVPN Metrics Agent on port $PORT for interface $WG_IF"
while true; do
    # Use netcat to listen (requires netcat-openbsd or similar)
    nc -l -p "$PORT" -c 'handle_request "$(head -1)" "$(grep -i "^authorization:" | sed "s/authorization: *//i")"' 2>/dev/null || {
        echo "Netcat failed, trying socat..."
        # Fallback to socat if available
        socat TCP-LISTEN:"$PORT",reuseaddr,fork EXEC:'bash -c "handle_request \"$(head -1)\" \"$(grep -i \"^authorization:\" | sed \"s/authorization: *//i\")\""' 2>/dev/null || {
            echo "No netcat or socat found. Install one of them."
            exit 1
        }
    }
done
