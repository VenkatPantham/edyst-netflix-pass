#!/usr/bin/env bash
set -x

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

BASEURL=${BASEURL:-http://localhost:5000}

newman run $SCRIPTDIR/postman_tests.json \
  --delay-request 500 \
  --global-var "BASEURL=$BASEURL" \
  --reporters cli,json \
  --reporter-json-export postman_output.json \

node parse.js "postman_output.json" > "edyst_test_report.json"