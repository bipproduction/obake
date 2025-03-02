import getRequiredData from "@/lib/get-required-data";
import log from "@/lib/log";
import type { ShellOutput } from "bun";
import { $ } from "bun";

const { dataAppJson, dataUploadJson } = await getRequiredData();
const { kirimLog, updateStatusRunning } = await log();
const key = process.env.TOKEN!;

if (!key) {
  console.error("key not found");
  process.exit(1);
}

async function step(
  { title }: { title: string },
  shell: () => Promise<ShellOutput>
) {
  await kirimLog("[RUN]".padEnd(10, " "), title);
  const { stdout, stderr, exitCode } = await shell();
  if (exitCode !== 0) {
    await kirimLog("[ERROR]".padEnd(10, " "), stderr.toString());
    throw new Error(stderr.toString());
  } else {
    await kirimLog("[SUCCESS]".padEnd(10, " "), title);
    await kirimLog("[INFO]".padEnd(10, " "), stdout.toString());
  }
}

async function main() {
  await updateStatusRunning();
//   await step(
//     {
//       title: "clone project",
//     },
//     () =>
//       $`git clone --branch \
//     ${dataAppJson.branch} \
//     https://x-access-token:${key}@github.com/bipproduction/${dataAppJson.repo}.git \
//     ${dataAppJson.appVersion}`
//   );

//   await step(
//     {
//       title: "create env",
//     },
//     () => $`echo "${dataAppJson.env}" > .env`.cwd(dataAppJson.appVersion)
//   );

  await step(
    {
      title: "install dependencies",
    },
    () => $`bun install`.cwd(dataAppJson.appVersion)
  );

  await step(
    {
      title: "db push",
    },
    () => $`bunx prisma db push`.cwd(dataAppJson.appVersion)
  );

  await step(
    {
      title: "db seeder",
    },
    () => $`bunx prisma db seed`.cwd(dataAppJson.appVersion).nothrow()
  );

  await step(
    {
      title: "run build",
    },
    () => $`bun --bun run build`.cwd(dataAppJson.appVersion)
  );

  await step(
    {
      title: "clean up node modules and .git",
    },
    () => $`rm -rf .git node_modules`
  );
}

main()
  .then(() => {
    kirimLog("[SUCCESS]".padEnd(10, " "), "Build Finished ...");
    updateStatusRunning(false);
    process.exit(0);
  })
  .catch((error) => {
    kirimLog("[ERROR]".padEnd(10, " "), error);
    updateStatusRunning(false);
    process.exit(1);
  });
