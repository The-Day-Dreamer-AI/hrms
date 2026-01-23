import React from "react";
import {Button} from "./button";
import {FileTextIcon, Loader2, UploadIcon} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {client} from "@/axios";
import {cn} from "@/lib/utils";
import {useToast} from "./use-toast";

export function FileUploader({
  value,
  onChange,
  id = "uploader",
}: {
  value?: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const {toast} = useToast();
  const {mutateAsync, isPending} = useMutation({
    mutationKey: ["upload-file"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        description: "The uploaded file is too large",
      }),
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const item = await client.post("/api/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onChange(item?.data?.url);
      return item.data;
    },
  });
  return (
    <React.Fragment>
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          max={2}
          accept=".jpeg,.jpg,.png,.gif,.webp,.pdf"
          id={id}
          hidden
          onChange={(e) =>
            e.target.files.length && mutateAsync(e.target.files[0])
          }
        />
        <Button
          variant="outline"
          disabled={isPending}
          type="button"
          asChild
          className={cn("w-fit", isPending && "opacity-50")}
        >
          <label htmlFor={id} className="cursor-pointer">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UploadIcon className="h-4 w-4 mr-2" />
            )}
            Upload File
          </label>
        </Button>
        {value && (
          value.toLowerCase().endsWith(".pdf") ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                isPending && "opacity-50",
                "flex items-center gap-2 p-3 rounded-md border w-fit hover:bg-muted"
              )}
            >
              <FileTextIcon className="h-8 w-8 text-red-500" />
              <span className="text-sm">View PDF</span>
            </a>
          ) : (
            <img
              className={cn(
                isPending && "opacity-50",
                "aspect-square rounded-md border object-cover max-w-xs"
              )}
              src={value}
              alt="uploader"
            />
          )
        )}
      </div>
    </React.Fragment>
  );
}
