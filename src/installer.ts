import * as core from "@actions/core";
import * as github from "@actions/github";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";

import { GITHUB_TOKEN, PACKER_VERSION } from "./constants";

function getPlatform() {
  switch (process.platform) {
    case "linux":
      return "linux";
    case "darwin":
      return "darwin";
    case "win32":
      return "windows";
    default:
      core.error(`Unsupported platform: ${process.platform}`);
      return;
  }
}

function getArch() {
  switch (process.arch) {
    case "x64":
      return "amd64";
    default:
      core.error(`Unsupported architecture: ${process.arch}`);
      return;
  }
}

function getVariant() {
  const platform = getPlatform();
  const arch = getArch();
  const variant = `${platform}_${arch}`;
  return variant;
}

async function getLatestVersion() {
  const octokit = github.getOctokit(GITHUB_TOKEN);
  const {
    data: { tag_name: _version },
  } = await octokit.repos.getLatestRelease({
    owner: "hashicorp",
    repo: "packer",
  });
  const version = _version.slice(1);
  return version;
}

async function getVersion() {
  if (PACKER_VERSION === "latest") {
    const latestVersion = await getLatestVersion();
    return latestVersion;
  } else {
    return PACKER_VERSION;
  }
}

function getDownloadUrl(version: string, variant: string) {
  const downloadUrl = `https://releases.hashicorp.com/packer/${version}/packer_${version}_${variant}.zip`;
  return downloadUrl;
}

export async function acquirePacker(): Promise<void> {
  const version = await getVersion();
  const variant = getVariant();
  const downloadUrl = getDownloadUrl(version, variant);
  const cachedPath = tc.find("packer", version, variant);
  if (cachedPath === "") {
    const downloadedPath = await tc.downloadTool(downloadUrl);
    const extractedPath = await tc.extractZip(downloadedPath);
    const cachedPath = await tc.cacheDir(
      extractedPath,
      "packer",
      version,
      variant
    );
    core.addPath(cachedPath);
  } else {
    core.addPath(cachedPath);
  }

  const packerPath = await io.which("packer", true);

  core.info(`Version: ${version}`);
  core.info(`Variant: ${variant}`);
  core.info(`Cache location: ${packerPath}`);
}
