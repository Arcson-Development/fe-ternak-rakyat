import { FileWithPath } from "@mantine/dropzone";

async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { mode: "no-cors" });
  const blob = await response.blob();
  return blob;
}

async function urlToFile(
  url: string,
  filename: string,
  mimeType: string
): Promise<FileWithPath> {
  const blob = await urlToBlob(url);
  const result: FileWithPath = new File([blob], filename, { type: mimeType });
  return result;
}

export { urlToFile };
