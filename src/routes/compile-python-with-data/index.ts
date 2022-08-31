import { FastifyBaseLogger, FastifyPluginAsync } from "fastify";
import { compilePython } from "../../compilers/compilePython";
import { MultipartFile } from "@fastify/multipart";
import * as pump from "pump";
import * as fs from "fs";

// TODO: improve test coverage
const compilePythonRoute: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.register(require('@fastify/multipart'));

  /**
   * This route accepts a multipart/form-data request with the following parts
   * - "code" = Python file to run (required)
   * - "data" = An input csv file. This will be accessible from the same folder as the python file (optional)
   *
   * URL params:
   * - "processorId" = A unique key to identify the Visspot processor node. This will be used to create a folder in the docker volume
   * - "sessionId" = A unique key to identify the Visspot session. This will be used to create a folder in the docker volume
   * TODO: If the code in the python file writes to a file named "result_data.csv" in its current directory then the route will return the contents of that file as a json array
   *
   *
   * Example request:
   *
   * curl -X POST \
   *  http://localhost:3000/compile-python \
   * -H 'Content-Type: multipart/form-data' \
   * -F code=@./code.py \
   * -F data=@./data.csv
   *
   *
   */
  fastify.post<{
    Params: {
      sessionId: string;
    };
  }>("/:sessionId", async function (request, reply) {
    try {
      const { sessionId } = request.params;

      const containerKey = sessionId;
      await removeDirectoryIfExists(
        `./src/python-box/${containerKey}`,
        fastify.log
      );
      createDockerVolumeFolderForProcessorIfNotExist(containerKey);

      const files = await request.files();
      for await (const part of files) {
        this.log.info("storing %s", part.filename);
        let fileName = getUploadedFilename(part);
        if (!fileName) {
          return reply.code(400).send({
            error: "Something went wrong while uploading the file",
          });
        }
        await storeUploadedFileInProcessorFolder(containerKey, fileName, part);
      }

      const { stdout, stderr } = await compilePython(this.log, containerKey);
      
      this.log.info({ stdout, stderr });
      this.log.info("SOME COOL INFO")

      return {
        output: stdout,
        error: stderr,
      };
    } catch (error: any) {
      this.log.error({ erro: error });
      return {
        error:
          error.message || "Something went wrong while compiling your code",
      };
    }
  });
};

async function storeUploadedFileInProcessorFolder(
  containerKey: string,
  fileName: string,
  part: MultipartFile
) {
  const storedFile = fs.createWriteStream(
    `./src/python-box/${containerKey}/${fileName}`
  );
  await pump(part.file, storedFile);
}

function getUploadedFilename(part: MultipartFile) {
  let fileName = "";
  if (part.fieldname === "code") {
    fileName = "codeToRun.py";
  } else if (part.fieldname === "data") {
    fileName = "data.csv";
  }
  return fileName;
}

/** This folder will be used as docker volume */
function createDockerVolumeFolderForProcessorIfNotExist(folderId: string) {
  const pathToDockerFolder = `./src/python-box/${folderId}`;
  if (!fs.existsSync(pathToDockerFolder)) {
    fs.mkdirSync(pathToDockerFolder);
  }
}

// function extractCodeOutputFromStdOut(stdOut: string): string {
//   // split by new line and remove the first element
//   const stdOutLines = stdOut.split("\n");
//   stdOutLines.shift();
//   return stdOutLines.join("\n");
// }

async function removeDirectoryIfExists(
  directoryPath: string,
  log: FastifyBaseLogger
) {
  if (fs.existsSync(directoryPath)) {
    log.debug(`Removing directory ${directoryPath}`);
    fs.rmdirSync(directoryPath, { recursive: true });
  }
}

export default compilePythonRoute;
