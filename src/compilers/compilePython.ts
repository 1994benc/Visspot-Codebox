import { exec } from "child_process";
import { FastifyBaseLogger } from "fastify";
import * as fs from "fs";

// TODO: improve test coverage
export const compilePython = async (log: FastifyBaseLogger, containerUniqueKey: string): Promise<{
    stdout: string;
    stderr: string;
}> => {

  const pathToDockerFolder = getCurrentPath() + "/src/python-box";

  // remove result_data.csv if it exists
  try {
    await fs.promises.unlink(`${pathToDockerFolder}/result_data.csv`);
  } catch (error) {
    log.debug("result_data.csv does not exist");
  }

  // remove output.txt if it exists
  try {
    await fs.promises.unlink(`${pathToDockerFolder}/output.txt`);
  } catch (error) {
    log.debug("output.txt does not exist");
  }

  //   give permission to execute the script
  const command = `chmod +x ${pathToDockerFolder}/compile.sh`;

  const promise = new Promise<{
    stdout: string;
    stderr: string;
}>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log.error({ error });
        reject(error);
        return;
      }
      log.info({ stdout });
      log.info({ stderr });
      const command =
        "sh " + pathToDockerFolder + "/compile.sh " + pathToDockerFolder + " " + containerUniqueKey;
      log.info("Running command: " + command);
      exec(command, (error, stdout, stderr) => {
        if (!error) {
          resolve({
            stdout,
            stderr,
          });
        } else {
          reject(error);
        }
        console.log({
          error,
          stdout,
          stderr,
        });
      });
    });
  });

  return promise;
};

export const getCurrentPath = (): string => {
  return process.cwd();
};
