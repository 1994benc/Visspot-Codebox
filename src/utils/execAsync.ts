import { exec } from "child_process";

export const execAsync = async (
  command: string,
): Promise<{ stdout: string; stderr: string }> => {
  const promise = new Promise<{ stdout: string; stderr: string }>(
    (resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          stdout,
          stderr,
        });
      });
    }
  );

  return promise;
};
