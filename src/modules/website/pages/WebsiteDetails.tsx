import DetailsForm from "@/components/ui/details-form";
import {z} from "zod";
import {useDetailsPageHook} from "@/hooks/useDetailsPageHook.ts";
import {useInfiniteQuery, useMutation, useQuery} from "@tanstack/react-query";
import {client} from "@/axios.ts";
import {useState} from "react";
import {UseFormReturn} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {
    FormItem,
    FormControl,
    FormLabel,
    FormDescription,
} from "@/components/ui/form";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import React from "react";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
    name: z.string().describe("Website name"),
    url: z.string().describe("Website url").url("Invalid URL format"),
    default_limit: z.number()
      .describe("Default Limit"),
    agency_id: z.number().describe("Agency"),
}).refine(
  (data) => {
    if (Number(data.default_limit.toFixed(2)) === data.default_limit) {
      return true
    }
    return false;
  },
  {
    message: "Can only put 2 decimal value",
    path: ["attachment"],
  }
);

export function WebsiteDetails() {
    const {isCreateMode, id, isEditMode} = useDetailsPageHook();
    const [form, setForm] = useState<UseFormReturn>();
    const navigate = useNavigate();
    const [defaultFormValue, setDefaultFormValue] =
        useState<Record<string, string | number>>();

    useQuery({
        enabled: Boolean(id),
        queryKey: ["website_details"],
        queryFn: async () => {
            const res = await client.get(`/api/websites/${id}`);

            const updatedData = {
                ...res.data.data,
                agency_id: res.data.data?.agency?.id
            };

            form.reset(updatedData);
            setDefaultFormValue(updatedData);
            return res.data;
        },
    });

    const {mutateAsync: createWebsite, isPending: isCreating} = useMutation({
        mutationKey: ["create-website"],
        onSuccess: () => navigate(-1),
        mutationFn: async ({
          name,
          url,
          default_limit,
          agency_id
        }: {
          name: string;
          url: string,
          default_limit: number,
          agency_id: number,
        }) => {
            const res = await client.post(`/api/websites`, {name, url, default_limit, agency_id});
            return res.data;
        },
    });

    const {mutateAsync: updateWebsite, isPending: isUpdating} = useMutation({
        onSuccess: () => navigate(-1),
        mutationKey: ["update-website"],
        mutationFn: async ({
          name,
          id,
          url,
          default_limit,
          agency_id
        }: {
            name: string;
            id: string;
            url: string,
            default_limit: number,
            agency_id: number,
        }) => {
            const res = await client.patch(`/api/websites/${id}`, {
                name,
                url,
                default_limit,
                agency_id
            });
            return res.data;
        },
    });

    return (
        <DetailsForm
            title={"Website Details"}
            isLoading={isUpdating || isCreating}
            formSchema={formSchema}
            getFormReferences={setForm}
            defaultValueOverride={defaultFormValue}
            onSubmit={async ({name, url, default_limit, agency_id}) => {
                const websiteData = {name, url, default_limit, agency_id};

                if (isEditMode) await updateWebsite({id, ...websiteData});
                if (isCreateMode) await createWebsite(websiteData);
            }}
            fieldConfig={{
                name: {inputProps: {placeholder: "Name"}},
                url: {inputProps: {placeholder: "E.g.: https://www.google.com"}},
                default_limit: {inputProps: {placeholder: "Default Limit E.g. 2500.25"}},
                agency_id: {
                    inputProps: {placeholder: "Agency"},
                    fieldType: AgencySelector,
                },
            }}
            breadcrumbs={[
                {title: "Home", path: "/"},
                {title: "Website", path: "/website"},
                {
                    title: isCreateMode ? "Create new website" : "Edit website information",
                },
            ]}
        />
    );
}

const AgencySelector = ({
    label,
    isRequired,
    field,
    fieldConfigItem,
}: AutoFormInputComponentProps) => {
  
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery({
    queryKey: ["websites"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await client.get("/api/agencies", {
        params: { page: pageParam },
      });
      return {
        nextPage: res.data.next_page_url ? pageParam + 1 : undefined,
        data: res.data.data?.map(({ id, company_name }) => ({
          value: id,
          label: company_name,
        })) || [],
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const items = data?.pages?.flatMap(page => page.data) || [];

  return (
    <React.Fragment>
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <Combobox
            value={field.value}
            isLoading={isFetching}
            onChange={field.onChange}
            options={items}
            onFetchNextPage={() => hasNextPage && fetchNextPage()}
          />
        </FormControl>
        {fieldConfigItem.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    </React.Fragment>
    );
  };
  