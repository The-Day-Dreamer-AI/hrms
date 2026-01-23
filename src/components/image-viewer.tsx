import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {EyeIcon} from "lucide-react";
import {PhotoProvider, PhotoView} from 'react-photo-view';

const isPdf = (url?: string) => url?.toLowerCase().endsWith(".pdf");

export function ViewAttachment({url, index}: { url?: string, index?: number }) {
    const label = index ? `Attachment ${index}` : 'Attachment';

    if (isPdf(url)) {
        return (
            <div className="flex space-x-2">
                <span className="max-w-[500px] truncate font-medium text-muted-foreground">
                    <Button
                        className={"h-7 px-2"}
                        variant={"outline"}
                        asChild
                    >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <EyeIcon className={"h-4 w-4 mr-1"}/>
                            View {label}
                        </a>
                    </Button>
                </span>
            </div>
        );
    }

    return <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium text-muted-foreground">
            <Tooltip>
              <TooltipTrigger is={"div"}>
                  <PhotoProvider>
                      <PhotoView src={url}>
                      <Button
                          className={"h-7 px-2"}
                          disabled={!url}
                          variant={"outline"}
                      >
                    <EyeIcon className={"h-4 w-4 mr-1"}/>
                    View {label}
                </Button>
              </PhotoView>
              </PhotoProvider>
              </TooltipTrigger>
                {!url && (
                    <TooltipContent>No attachment submitted</TooltipContent>
                )}
            </Tooltip>
          </span>
    </div>
}