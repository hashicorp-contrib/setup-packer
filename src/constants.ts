import * as core from "@actions/core";

export const GITHUB_TOKEN = core.getInput("github-token");

export const PACKER_VERSION = core.getInput("packer-version");
