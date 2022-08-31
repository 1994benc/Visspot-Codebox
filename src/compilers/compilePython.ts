import { FastifyBaseLogger } from "fastify";
import { execAsync } from "../utils/execAsync";

// TODO: improve test coverage
export const compilePython = async (
  log: FastifyBaseLogger,
  containerUniqueKey: string
): Promise<{
  stdout: string;
  stderr: string;
}> => {
  const pathToDockerFolder = getCurrentPath() + "/src/python-box";
  const volumeDirectoryPath = `${pathToDockerFolder}/${containerUniqueKey}`;

  const makeDirectoryCommand = `mkdir -p ${volumeDirectoryPath}`;
  const { stdout: stdoutMakeDirectory, stderr: stderrMakeDirectory } =
    await execAsync(makeDirectoryCommand);
  log.debug({ stdoutMakeDirectory });
  log.debug({ stderrMakeDirectory });
  if (stderrMakeDirectory) {
    throw new Error(stderrMakeDirectory);
  }
  const copyFileCommand = `cp -r ${pathToDockerFolder}/Dockerfile ${volumeDirectoryPath}`;
  const { stdout: stdoutCopyFile, stderr: stderrCopyFile } = await execAsync(
    copyFileCommand
  );
  log.debug({ stdoutCopyFile });
  log.debug({ stderrCopyFile });
  if (stderrCopyFile) {
    throw new Error(stderrCopyFile);
  }
  const dockerBuildCommand = `docker build --quiet -t ${containerUniqueKey} ${volumeDirectoryPath}`;
  const { stdout: stdoutDockerBuild, stderr: stderrDockerBuild } =
    await execAsync(dockerBuildCommand);
  log.debug({ stdoutDockerBuild });
  log.debug({ stderrDockerBuild });
  if (stderrDockerBuild) {
    throw new Error(stderrDockerBuild);
  }

  const dockerRunCommand = `echo $(docker run --rm -i -v ${volumeDirectoryPath}:/usr/app/src ${containerUniqueKey})`;
  const { stdout: stdoutDockerRun, stderr: stderrDockerRun } = await execAsync(
    dockerRunCommand
  );
  log.info({ stdoutDockerRun });
  log.debug({ stderrDockerRun });

  const removeDirectoryCommand = `rm -rf ${volumeDirectoryPath}`;
  const { stdout: stdoutRemoveDirectory, stderr: stderrRemoveDirectory } =
    await execAsync(removeDirectoryCommand);
  log.debug({ stdoutRemoveDirectory });
  log.debug({ stderrRemoveDirectory });
  if (stderrRemoveDirectory) {
    throw new Error(stderrRemoveDirectory);
  }

  log.info({ stdoutDockerRun });

  return {
    stdout: stdoutDockerRun,
    stderr: stderrDockerRun,
  };
};

export const getCurrentPath = (): string => {
  return process.cwd();
};


