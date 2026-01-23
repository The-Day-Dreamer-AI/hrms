import dayjs from "dayjs";
import { z } from "zod";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { client } from "@/axios.ts";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types.ts";
import { Combobox } from "@/components/ui/combobox.tsx";
import DetailsForm from "@/components/ui/details-form";
import { FileUploader } from "@/components/ui/file-uploader";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useDetailsPageHook } from "@/hooks/useDetailsPageHook";

const formSchema = z.object({
  claim_type_id: z.number().describe("Claim Type"),
  receipt_number: z.string().describe("Receipt number"),
  amount: z.number().describe("Claim Amount"),
  date: z.date().describe("Receipt Date"),
  remarks: z.string().describe("Remarks"),
  attachment: z.string().describe("Attachment 1"),
  attachment2: z.string().optional().describe("Attachment 2"),
});

export function ClaimDetails() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<UseFormReturn>();
  const [defaultFormValues, setDefaultFormValues] = useState({});
  const { id, isEditMode } = useDetailsPageHook();

  // Fetch claim details if in edit mode
  const { data: claimData } = useQuery({
    queryKey: ["claim", id],
    enabled: isEditMode && !!id,
    queryFn: async () => {
      const response = await client.get(`/api/user-claims/${id}`);
      const claim = response.data?.data;

      if (isEditMode && claim && claim.status !== "pending") {
        toast({
          title: "Cannot edit claim",
          description: "Only pending claims can be edited.",
        });
        navigate("/claim");
        return null;
      }

      return response.data;
    },
  });

  // Set form default values when claim data is fetched
  React.useEffect(() => {
    if (!claimData?.data || !form) {
      return;
    }

    const claim = claimData.data;

    const updatedValues = {
      claim_type_id: claim?.claim_type_id,
      receipt_number: claim?.receipt_number,
      amount: Number(claim?.amount),
      date: dayjs(claim?.date).toDate(),
      remarks: claim?.remarks,
      attachment: claim?.attachment,
      attachment2: claim?.attachment2,
    };

    form.reset(updatedValues);
    setDefaultFormValues(updatedValues);
  }, [claimData, form]);

  const {mutateAsync: createClaim} = useMutation({
    mutationKey: ["createClaims"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        description: (d as any)?.response?.data?.message,
      }),
    onSuccess: () => navigate(-1),
    mutationFn: async (data: any) => {
      return await client.post("/api/user-claims", {
        claim_type_id: data?.claim_type_id,
        receipt_number: data?.receipt_number,
        amount: data?.amount,
        date: dayjs(data.date).format("YYYY-MM-DD"),
        remarks: data?.remarks,
        attachment: data?.attachment,
        attachment2: data?.attachment2,
      });
    },
  });

  const {mutateAsync: updateClaim, isPending: isUpdating} = useMutation({
    mutationKey: ["updateClaims"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        description: (d as any)?.response?.data?.message,
      }),
    onSuccess: () => navigate(-1),
    mutationFn: async (data: any) => {
      return await client.patch(`/api/user-claims/${id}`, {
        claim_type_id: data?.claim_type_id,
        receipt_number: data?.receipt_number,
        amount: data?.amount,
        date: dayjs(data.date).format("YYYY-MM-DD"),
        remarks: data?.remarks,
        attachment: data?.attachment,
        attachment2: data?.attachment2,
      });
    },
  });

  return (
    <React.Fragment>
      <DetailsForm
        getFormReferences={setForm}
        title={isEditMode ? "Edit claim" : "Apply claims"}
        isLoading={isUpdating}
        formSchema={formSchema}
        defaultValueOverride={defaultFormValues}
        breadcrumbs={[
          {title: "Home", path: "/"},
          {title: "Claims", path: "/claim"},
          {title: isEditMode ? "Edit Claim" : "Apply Claims"},
        ]}
        onSubmit={async (v) => {
          if (isEditMode) {
            await updateClaim(v);
          } else {
            await createClaim(v);
          }
        }}
        fieldConfig={{
          attachment: {
            fieldType: ({
              label,
              isRequired,
              field,
              fieldConfigItem,
            }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <div>
                      <FileUploader
                        id="attachment1-uploader"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    {fieldConfigItem.description && (
                      <FormDescription>
                        {fieldConfigItem.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
              );
            },
          },
          attachment2: {
            fieldType: ({
              label,
              isRequired,
              field,
              fieldConfigItem,
            }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <div>
                    <FileUploader
                        id="attachment2-uploader"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                  {fieldConfigItem.description && (
                      <FormDescription>
                        {fieldConfigItem.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
              );
            },
          },
          claim_type_id: {
            fieldType: ClaimTypesSelector,
          },
          receipt_number: {
            inputProps: { placeholder: "Enter receipt number" },
          },
          amount: {
            inputProps: {placeholder: "Enter claim amount"},
            fieldType: ({
              label,
              isRequired,
              field,
              fieldConfigItem,
            }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Enter claim amount"}
                      value={field.value}
                      onChange={field.onChange}
                      type="number"
                      step="0.01"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                  {fieldConfigItem.description && (
                      <FormDescription>
                        {fieldConfigItem.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
              );
            },
          },
          remarks: {
            fieldType: ({
              label,
              isRequired,
              field,
              fieldConfigItem,
            }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                  <Textarea
                      placeholder={"Enter your reason"}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                  {fieldConfigItem.description && (
                      <FormDescription>
                        {fieldConfigItem.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
              );
            },
          },
        }}
      />
    </React.Fragment>
  );
}

const ClaimTypesSelector = ({
  label,
  isRequired,
  field,
  fieldConfigItem,
}: AutoFormInputComponentProps) => {
  const {data, fetchNextPage, isFetching, hasNextPage} = useInfiniteQuery({
    queryKey: ['claim_types'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await client.get("/api/claim-types", {
        params: { page: pageParam },
      });
      return {
        nextPage: res.data.next_page_url ? pageParam + 1 : undefined,
        data: res.data['data']?.map(({ id, name }) => ({
          value: id,
          label: name,
        })) || [],
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const items = data?.pages?.flatMap(({ data }) => data) || [];

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
