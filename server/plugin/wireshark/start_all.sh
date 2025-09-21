#!/bin/bash
# Activate venv
source /home/cpe27/env/bin/activate

# Run scripts inside venv
python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/https.py &
python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/stats.py &
python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/scan.py &

# Wait for background jobs
wait