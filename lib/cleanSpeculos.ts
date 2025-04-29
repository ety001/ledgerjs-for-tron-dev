import { execSync } from "child_process";

export default function (): string[] {
  const instances = execSync("docker ps -a -q --filter name=speculos")
    .toString()
    .split(/\s/g)
    .filter(Boolean);

  if (instances.length > 0) {
    execSync("docker container rm -f " + instances.join(" "));
  }
  return instances;
}