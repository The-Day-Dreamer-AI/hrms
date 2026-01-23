import DetailsForm from "@/components/ui/details-form";
import {z} from "zod";
import {useDetailsPageHook} from "@/hooks/useDetailsPageHook.ts";
import {useInfiniteQuery, useMutation, useQuery} from "@tanstack/react-query";
import {client} from "@/axios.ts";
import {useState} from "react";
import {UseFormReturn} from "react-hook-form";
import {Card} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useNavigate} from "react-router-dom";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import {
    FormItem,
    FormControl,
    FormLabel,
    FormDescription,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import React from "react";

const formSchema = z.object({
    name: z.string().describe("Branch name"),
    claim_limits: z
        .array(
            // Define the fields for each item
            z.object({
                claim_type_name: z.string(),
                limit_amount: z.coerce.number().describe("Limit amount"),
                claim_type_id: z.coerce.number(),
            }),
        )
        .describe("Claim Type"),
    marketing_claim_limits: z
        .array(z.object({
            marketing_claim_type_name: z.string(),
            limit_amount: z.coerce.number().describe("Limit amount"),
            marketing_claim_type_id: z.coerce.number(),
        })).describe("Marketing Claim Type"),
    team_id: z.number().describe("Team")
});

export function BranchDetails() {
    const {isCreateMode, id, isEditMode} = useDetailsPageHook();
    const [form, setForm] = useState<UseFormReturn>();
    const navigate = useNavigate();
    const [defaultFormValue, setDefaultFormValue] =
        useState<Record<string, any>>();

    useQuery({
        enabled: Boolean(id),
        queryKey: ["branch_details"],
        queryFn: async () => {
            const res = await client.get(`/api/branches/${id}`);
            const allClaimTypes = await client.get("/api/claim-types");
            const allMarketingClaimTypes = await client.get("/api/marketing-claim-types")

            // Fetch marketing claim limits
            const remainingMarketingClaims = allMarketingClaimTypes?.data?.data
                .filter((c) => !res.data.data.marketing_claim_limits.find(({marketing_claim_type_id}) => marketing_claim_type_id === c.id))
                .map(({id, name, default_limit}) => ({
                    marketing_claim_type_id: id,
                    marketing_claim_type_name: name,
                    limit_amount: default_limit,
                }))

            // Fetch claim limits
            const remaining = allClaimTypes.data.data
                .filter((c) => !res.data.data.claim_limits.find(({claim_type_id}) => claim_type_id === c.id))
                .map(({id, name, default_limit}) => ({
                    claim_type_id: id,
                    claim_type_name: name,
                    limit_amount: default_limit,
                }));

            const updatedData = {
                ...res.data.data,
                claim_limits: [...res.data.data.claim_limits, ...remaining],
                marketing_claim_limits: [...res.data.data.marketing_claim_limits, ...remainingMarketingClaims].map((item) => ({
                    ...item,
                    limit_amount: item.limit_amount.replace(',', '')
                })),
            };

            form.reset(updatedData);
            setDefaultFormValue(updatedData);
            return res.data;
        },
    });

    useQuery({
        enabled: isCreateMode,
        queryKey: ["claim-types"],
        queryFn: async () => {
            const marketingClaimTypes = await client.get("/api/marketing-claim-types", {})
            const res = await client.get("/api/claim-types", {});
            const updated = {
                marketing_claim_limits: marketingClaimTypes.data?.data?.map((item) => ({
                    marketing_claim_type_name: item?.name,
                    limit_amount: item?.default_limit,
                    marketing_claim_type_id: item?.id,
                })),
                claim_limits: res?.data?.data?.map((item) => ({
                    claim_type_name: item?.name,
                    limit_amount: item?.default_limit,
                    claim_type_id: item?.id,
                })),
            };
            form.reset(updated);
            setDefaultFormValue(updated);
            return res.data || [];
        },
    });


    const {mutateAsync: createBranch, isPending: isCreating} = useMutation({
        mutationKey: ["create-branch"],
        onSuccess: () => navigate(-1),
        mutationFn: async ({
                name,
                claim_limits,
                marketing_claim_limits,
                team_id
            }: {
            name: string;
            claim_limits: any[];
            marketing_claim_limits: any[]
            team_id: number
        }) => {
            const data = {name, claim_limits, marketing_claim_limits, team_id}
            const res = await client.post(`/api/branches`, data );

            return res.data;
        },
    });

    const {mutateAsync: updateBranch, isPending: isUpdating} = useMutation({
        onSuccess: () => navigate(-1),
        mutationKey: ["update-branch"],
        mutationFn: async ({
                               marketing_claim_limits,
                               claim_limits,
                               name,
                               id,
                               team_id
                           }: {
            name: string;
            id: string;
            marketing_claim_limits: any[]
            claim_limits: any[];
            team_id: number
        }) => {
            const res = await client.patch(`/api/branches/${id}`, {
                marketing_claim_limits,
                claim_limits,
                name,
                team_id
            });
            return res.data;
        },
    });

    return (
        <DetailsForm
            title={"Branch Details"}
            isLoading={isUpdating || isCreating}
            formSchema={formSchema}
            getFormReferences={setForm}
            defaultValueOverride={defaultFormValue}
            onSubmit={async ({name, claim_limits, marketing_claim_limits, team_id}) => {
                const branchData = {name, claim_limits, marketing_claim_limits, team_id}

                if (isEditMode) await updateBranch({...branchData, id});
                if (isCreateMode) await createBranch(branchData);
            }}
            fieldConfig={{
                name: {inputProps: {placeholder: "Name"}},
                claim_limits: {
                    notEditable: true,
                    claim_type_id: {fieldType: () => <div/>},
                    claim_type_name: {
                        fieldType: ({field}) => {
                            return <Label>{field.value}</Label>;
                        },
                    },
                    renderParent: ({children}) => {
                        return <Card className={"px-4 col-span-6"}>{children}</Card>;
                    },
                },
                marketing_claim_limits: {
                    notEditable: true,
                    marketing_claim_type_id: {fieldType: () => <div/>},
                    marketing_claim_type_name: {
                        fieldType: ({field}) => {
                            return <Label>{field.value}</Label>;
                        },
                    },
                    renderParent: ({children}) => {
                        return <Card className={"px-4 col-span-6"}>{children}</Card>;
                    },
                },
                team_id: {
                    inputProps: { placeholder: "Select a team for that branch" },
                    fieldType: TeamSelector,
                },
            }}
            breadcrumbs={[
                {title: "Home", path: "/"},
                {title: "Branch", path: "/branch"},
                {
                    title: isCreateMode ? "Create new branch" : "Edit branch information",
                },
            ]}
        />
    );
}
  
const TeamSelector = ({
    label,
    isRequired,
    field,
    fieldConfigItem,
}: AutoFormInputComponentProps) => {
    const [search, setSearch] = useState<string>('');
  
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery({
    queryKey: ["teams", search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await client.get("/api/teams", {
        params: { name: search, page: pageParam },
      });
      return {
        nextPage: res.data.next_page_url ? pageParam + 1 : undefined,
        data: res.data.data?.map(({ id, name }) => ({
          value: id,
          label: name,
        })) || [],
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const teamData = data?.pages?.flatMap(page => page.data) || [];

  return (
    <React.Fragment>
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <Combobox
            onSearchChange={(e) => setSearch(e as string)}
            value={field.value}
            isLoading={isFetching}
            onChange={field.onChange}
            options={teamData}
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
  
