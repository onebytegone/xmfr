#!/bin/bash
# Generate all example outputs for xmfr
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"


echo "Generating simple-list example..."
cat examples/simple-list/simple-list-data.json \
   | node "${SCRIPT_DIR}/../dist/cli.js" -t simple-list -o examples/simple-list/simple-list-output.html

echo "All example outputs generated."
