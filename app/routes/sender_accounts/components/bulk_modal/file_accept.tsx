import { FaUpload } from "react-icons/fa";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { useDropzone } from "react-dropzone-esm";

export function FileAccept({ setData }: { setData: (first: File) => unknown }) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0]!;
    setData(file);
  };
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) setData(acceptedFiles[0]!);
    return;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "text/csv": [".csv"],
    },
  });
  const size = 100;

  return (
    <div {...getRootProps()} className="flex  justify-center">
      <button
        onClick={handleClick}
        className={` ${isDragActive ? "bg-primary bg-opacity-70" : "hover:bg-secondary"}  flex h-60 w-full cursor-pointer justify-center align-middle *:m-auto`}
      >
        <FaUpload
          className={isDragActive ? "text-secondary" : "text-primary"}
          size={size}
        />
        <input
          {...getInputProps()}
          type="file"
          accept=".csv"
          ref={hiddenFileInput}
          className="hidden"
          onChange={handleFileChange}
        />
      </button>
    </div>
  );
}

export function FileAcceptSmall({
  setData,
}: {
  setData: (first: File) => unknown;
}) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0]!;
    setData(file);
  };
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) setData(acceptedFiles[0]!);
    return;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "text/csv": [".csv"],
    },
  });
  const size = 8 * 2;

  return (
    <div {...getRootProps()}>
      <Button
        onClick={handleClick}
        variant={"secondary"}
        className="flex gap-1"
      >
        <FaUpload
          className={isDragActive ? "text-secondary" : "text-primary"}
          size={size}
        />
        <p>Choose Another File</p>

        <input
          {...getInputProps()}
          type="file"
          accept=".csv"
          ref={hiddenFileInput}
          className="hidden"
          onChange={handleFileChange}
        />
      </Button>
    </div>
  );
}
