#!/usr/bin/env node
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const args = process.argv.slice(2);
const path = `/${process.cwd()}/version.txt`;

const getFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const createFile = promisify(fs.writeFile);
const execCMD = promisify(exec);

export async function create(text) {
  await createFile(path, text);
}
async function read() {
  const res = getFile(path, "utf-8");
  return res;
}
async function update(text) {
  await writeFile(path, text);
  console.log("Version updated to ", text);
}

async function gitManager(message) {
  try {
    await execCMD("git init");
    console.log("Git initialized");
  } catch (error) {}
  try {
    await execCMD("git add .");
    const { stdout, stderr } = await execCMD(`git commit -m '${message}'`);
    if (stderr) {
      console.error(stderr);
    }
    console.log(stdout);
  } catch (err) {
    console.error(err.stdout);
  }
}
async function major() {
  const res = await read();
  const version = res.split(".");
  const major = parseInt(version[0]);
  gitManager(`Version ${major + 1}.0.0`);
  return `${major + 1}.0.0`;
}
async function minor() {
  const res = await read();
  const version = res.split(".");
  const major = parseInt(version[0]);
  const minor = parseInt(version[1]);
  gitManager(`Version ${major}.${minor + 1}.0.0`);
  return `${major}.${minor + 1}.0`;
}
async function patch() {
  const res = await read();
  const version = res.split(".");
  const major = parseInt(version[0]);
  const minor = parseInt(version[1]);
  const patch = parseInt(version[2]);
  gitManager(`Version ${major}.${minor}.${patch + 1}`);
  return `${major}.${minor}.${patch + 1}`;
}

if (args.length) {
  if (args[0] === "help") {
    console.log("Link to doc");
  } else if (args[0] === "init") {
    try {
      await read();
      console.log("vmjs already initialized");
    } catch (error) {
      create("1.0.0");
      console.log("vmjs starting...\n");
      gitManager("Version 1.0.0");
    }
  } else {
    try {
      await read();

      if (args[0] === "major") {
        update(await major());
      } else if (args[0] === "minor") {
        update(await minor());
      } else if (args[0] === "patch") {
        update(await patch());
      }
    } catch (error) {
      console.log(
        "File version.txt not found. Please run 'vmjs init' to create the file."
      );
    }
  }
} else {
  try {
    const res = await read();
    console.log("Current version is: ", res);
  } catch (err) {
    console.log(
      "File version.txt not found. Please run 'vmjs init' to create the file."
    );
  }
}
