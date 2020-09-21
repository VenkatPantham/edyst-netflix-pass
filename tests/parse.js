const fs = require("fs");
const { title } = require("process");
const url = require("url");

const postman_output_file = process.argv[2] || "./postman_output.json";

const raw_data = fs.readFileSync(postman_output_file);
const postman_output = JSON.parse(raw_data);

// {total, pending, failed}
const { stats, executions } = postman_output.run;

function requestUrlToString(request) {
  const url = new URL("http://localhost");
  url.host = request.url.host[0];
  url.port = request.url.port;
  url.protocol = request.url.protocol;
  url.pathname = request.url.path;

  for (const { key, value } of request.url.query) {
    url.searchParams.set(key, decodeURI(value));
  }

  return url.toString();
}

function hasTestFailed(execution) {
  const failedAtLeastOneAssertion =
    execution.assertions &&
    execution.assertions.some((assertion) => assertion.error);

  const failedTestScript =
    execution.testScript &&
    execution.testScript.some((testScript) => testScript.error);

  return failedAtLeastOneAssertion || failedTestScript;
}

let counter = 1;
let tests = [];
for (const execution of executions) {
  const {
    item,
    request,
    response,
    assertions = [],
    testScript = [],
  } = execution;

  const test = {
    id: item.id,
    title: item.name,
    passed: !hasTestFailed({ assertions, testScript }),
  };

  let comment =
    `${test.passed ? "✔" : "✘"} ${test.title}` +
    "\n" +
    `  ${request.method} ${requestUrlToString(request)}` +
    " " +
    `[${response.code} ${response.status}]\n`;

  let errors = [];

  for (const assertion of assertions) {
    const err = assertion.error;
    if (!err) continue;
    errors.push(`  ${counter}. ${err.test}: ${err.message}`);
    counter += 1;
  }

  for (const test of testScript) {
    const err = test.error;
    if (!err) continue;
    errors.push(`  ${counter}. ${err.name} in test-script`);
    counter += 1;
  }

  comment += errors.join("\n");

  test.comment = comment;

  tests.push(test);
}

console.log(JSON.stringify({ tests }));
