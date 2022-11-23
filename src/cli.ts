#!/usr/bin/env node
import { Shinobi } from "./node-api";

function main(files: Array<string>) {
  const shinobi = new Shinobi();

  for (const file of files) {
    shinobi.load(file);
  }

  const output = shinobi.render();
  console.log(output);
}

main(process.argv.slice(2));
