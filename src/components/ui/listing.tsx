import React from "react";
import {Button} from "./button";
import {LucidePlus} from "lucide-react";
import {ModuleTitle} from "@/components/module-title.tsx";

export function ListingHeader({
                                  title,
                                  description,
                                  onAddButtonClicked,
                                  buttonLabel,
                              }: {
    title?: string;
    description?: string;
    onAddButtonClicked?: () => void;
    buttonLabel?: string;
}) {
    return (
        <React.Fragment>
            <div className="flex md:flex-row flex-col justify-between w-full md:items-center gap-2">
                {(title || description) && (
                    <div>
                        {title && <ModuleTitle>{title}</ModuleTitle>}
                        {description && (
                            <p className="text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}
                {onAddButtonClicked && (
                    <div>
                        <Button
                            size='sm'
                            onClick={() => {
                                if (onAddButtonClicked) onAddButtonClicked();
                            }}
                        >
                            <LucidePlus size={16} className="me-2"/>
                            Add {buttonLabel}
                        </Button>
                    </div>


                )}
            </div>
        </React.Fragment>
    );
}
