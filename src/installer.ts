import * as os from "node:os";

import * as core from "@actions/core";
import * as github from "@actions/github";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";

import { GITHUB_TOKEN, PACKER_VERSION } from "./constants";

function getPlatform() {
  const platform = os.platform();
  switch (platform) {
    case "darwin": {
      return "darwin";
    }
    case "freebsd": {
      return "freebsd";
    }
    case "linux": {
      return "linux";
    }
    case "openbsd": {
      return "openbsd";
    }
    case "win32": {
      return "windows";
    }
    default: {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

function getArchitecture() {
  const arch = os.arch();
  switch (arch) {
    case "arm": {
      return "arm";
    }
    case "arm64": {
      return "arm64";
    }
    case "x32": {
      return "386";
    }
    case "x64": {
      return "amd64";
    }
    default: {
      throw new Error(`Unsupported architecture: ${arch}`);
    }
  }
}

function getVariant() {
  const platform = getPlatform();
  const architecture = getArchitecture();
  const variant = `${platform}_${architecture}`;
  return variant;
}

async function getLatestVersion() {
  const octokit = github.getOctokit(GITHUB_TOKEN);
  const {
    data: { tag_name: _version },
  } = await octokit.rest.repos.getLatestRelease({
    owner: "hashicorp",
    repo: "packer",
  });
  const version = _version.slice(1);
  return version;
}

async function getVersion(version: string) {
  if (version === "latest") {
    const latestVersion = await getLatestVersion();
    return latestVersion;
  } else {
    return version;
  }
}

function getDownloadUrl(version: string, variant: string) {
  const downloadUrl = `https://releases.hashicorp.com/packer/${version}/packer_${version}_${variant}.zip`;
  return downloadUrl;
}

export async function acquirePacker(): Promise<void> {
  const version = await getVersion(PACKER_VERSION);
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
      variant,
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
