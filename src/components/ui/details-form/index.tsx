import {ModuleTitle} from "@/components/module-title";
import AutoForm, {TAutoFormProps} from "../auto-form";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../breadcrumb";
import {BackButton} from "./back-button";
import {SubmitBar} from "./submit-bar";
import React from "react";
import {useNavigate} from "react-router-dom";
import {ZodObjectOrWrapped} from "../auto-form/utils";

export default function DetailsForm<SchemaType extends ZodObjectOrWrapped>({
  title,
  breadcrumbs,
  isLoading,
  ...remaining
}: {
  title: string;
  breadcrumbs: {path?: string; title: string}[];
  isLoading: boolean;
} & TAutoFormProps<SchemaType>) {
  const navigate = useNavigate();
  return (
    <div className={"max-w-2xl flex flex-col space-y-4 mx-auto"}>
      <div className={"flex flex-col space-y-2 items-start"}>
        <BackButton />
        <ModuleTitle>{title}</ModuleTitle>
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem
                  onClick={() =>
                    breadcrumb?.path ? navigate(breadcrumb?.path) : () => {}
                  }
                >
                  {breadcrumb?.path ? (
                    <BreadcrumbLink className="cursor-pointer">
                      {breadcrumb.title}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {breadcrumbs?.length - 1 > index && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <AutoForm className={"mt-4 mb-[60px]"} {...remaining}>
        <SubmitBar isLoading={isLoading} />
      </AutoForm>
    </div>
  );
}
