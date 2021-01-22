import * as core from "@actions/core";

import { acquirePacker } from "./installer";

async function run() {
  try {
    await acquirePacker();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
