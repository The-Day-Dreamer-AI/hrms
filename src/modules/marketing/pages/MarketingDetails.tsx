import dayjs from "dayjs";
import { z } from "zod";

import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { client } from "@/axios.ts";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types.ts";
import { Combobox } from "@/components/ui/combobox";
import DetailsForm from "@/components/ui/details-form";
import { FileUploader } from "@/components/ui/file-uploader";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useDetailsPageHook } from "@/hooks/useDetailsPageHook";
import { CLAIM_STATUS } from "@/constants.ts";

const formSchema = z.object({
  marketing_claim_type_id: z.number().describe("Marketing claim type"),
  agencies_id: z.number().describe("Agency"),
  website_id: z.number().describe("Website"),
  receipt_number: z.string().describe("Receipt number"),
  amount: z.string().describe("Amount"),
  date: z.date().describe("Claim date"),
  remarks: z.string().describe("Remarks"),
  attachment: z.string().describe("Attachment"),
});

export function MarketingDetails() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<UseFormReturn>();
  const [defaultFormValues, setDefaultFormValues] = useState({});
  const [isAgencySelected, setIsAgencySelected] = useState(false);
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [websiteId, setWebsiteId] = useState<string>("");
  const { id, isEditMode } = useDetailsPageHook();

  // Fetch marketing claim details if in edit mode
  const { data: marketingClaimData } = useQuery({
    queryKey: ["marketing_claim", id],
    enabled: isEditMode && !!id,
    queryFn: async () => {
      const response = await client.get(`/api/user-marketing-claims/${id}`);
      const claim = response.data?.data;

      if (isEditMode && claim && claim.status !== CLAIM_STATUS.PENDING) {
        toast({
          title: "Cannot edit marketing claim",
          description: "Only pending claims can be edited.",
        });
        navigate("/marketing");
        return null;
      }

      return response.data;
    },
  });

  // Set form default values when marketing claim data is fetched
  React.useEffect(() => {
    if (!marketingClaimData?.data || !form) {
      return;
    }

    const claim = marketingClaimData.data;

    const updatedValues = {
      marketing_claim_type_id: claim?.marketing_claim_type_id,
      agencies_id: claim?.agency_id,
      website_id: claim?.website_id ? Number(claim.website_id) : undefined,
      receipt_number: claim?.receipt_number,
      amount: claim?.amount,
      date: dayjs(claim?.date).toDate(),
      remarks: claim?.remarks,
      attachment: claim?.attachment,
    };

    form.reset(updatedValues);
    setDefaultFormValues(updatedValues);
    
    // Set agency and website state for proper form behavior
    if (claim?.agency_id) {
      setAgencyId(claim.agency_id);
      setIsAgencySelected(true);
    }
    if (claim?.website_id) {
      setWebsiteId(claim.website_id.toString());
    }
  }, [marketingClaimData, form]);

  const { mutateAsync: createMarketingClaim } = useMutation({
    mutationKey: ["create_marketing_claims"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (d as any)?.response?.data?.message,
      }),
    onSuccess: () => navigate(-1),
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await client.post("/api/user-marketing-claims", {
        marketing_claim_type_id: data?.marketing_claim_type_id,
        receipt_number: data?.receipt_number,
        amount: data?.amount,
        date: dayjs(data?.date).format("YYYY-MM-DD"),
        remarks: data?.remarks,
        agencies_id: data?.agencies_id,
        attachment: data?.attachment,
        website_id: data?.website_id ? Number(data.website_id) : undefined,
      });
    },
  });

  const { mutateAsync: updateMarketingClaim, isPending: isUpdating } = useMutation({
    mutationKey: ["update_marketing_claims"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (d as any)?.response?.data?.message,
      }),
    onSuccess: () => navigate(-1),
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await client.patch(`/api/user-marketing-claims/${id}`, {
        marketing_claim_type_id: data?.marketing_claim_type_id,
        receipt_number: data?.receipt_number,
        amount: data?.amount,
        date: dayjs(data?.date).format("YYYY-MM-DD"),
        remarks: data?.remarks,
        agencies_id: data?.agencies_id,
        attachment: data?.attachment,
        website_id: data?.website_id ? Number(data.website_id) : undefined,
      });
    },
  });

  useEffect(() => {
    if (form) {
      const subscription = form.watch((value) => {
        if (value.agencies_id) {
          setAgencyId(value.agencies_id);
          setIsAgencySelected(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [form]);

  return (
    <React.Fragment>
      <DetailsForm
        getFormReferences={setForm}
        title={isEditMode ? "Edit marketing claim" : "Apply marketing claims"}
        isLoading={isUpdating}
        formSchema={formSchema}
        defaultValueOverride={defaultFormValues}
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Marketing claims", path: "/marketing" },
          { title: isEditMode ? "Edit marketing claim" : "Apply marketing claims" },
        ]}
        onSubmit={async (v) => {
          if (isEditMode) {
            await updateMarketingClaim(v);
          } else {
            await createMarketingClaim(v);
          }
        }}
        fieldConfig={{
          agencies_id: {
            fieldType: (props) => (
              <AgencySelector {...props} onAgencySelect={setIsAgencySelected} setWebsiteId={setWebsiteId} />
            ),
          },
          website_id: {
            fieldType: (props) => {
              return isAgencySelected ? (
                <WebsiteSelector {...props} agencyId={agencyId} websiteId={websiteId} setWebsiteId={setWebsiteId} />
              ) : (
                ""
              );
            },
          },
          marketing_claim_type_id: { fieldType: MarketingClaimSelector },
          amount: {
            fieldType: ({ label, isRequired, field, fieldConfigItem }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Enter your amount"}
                      value={field.value}
                      type="number"
                      step="0.01"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    {fieldConfigItem.description && <FormDescription>{fieldConfigItem.description}</FormDescription>}
                  </div>
                </FormItem>
              );
            },
          },
          attachment: {
            fieldType: ({ label, isRequired, field, fieldConfigItem }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <div>
                      <FileUploader value={field.value} onChange={field.onChange} />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    {fieldConfigItem.description && <FormDescription>{fieldConfigItem.description}</FormDescription>}
                  </div>
                </FormItem>
              );
            },
          },

          remarks: {
            fieldType: ({ label, isRequired, field, fieldConfigItem }: AutoFormInputComponentProps) => {
              return (
                <FormItem className="">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder={"Enter your reason"} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    {fieldConfigItem.description && <FormDescription>{fieldConfigItem.description}</FormDescription>}
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

const AgencySelector = ({
  label,
  isRequired,
  field,
  fieldConfigItem,
  onAgencySelect,
  setWebsiteId,
}: AutoFormInputComponentProps & {
  onAgencySelect: (isSelected: boolean) => void;
  setWebsiteId: (id: string) => void;
}) => {
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery({
    queryKey: ["agencies"],
    queryFn: async ({ pageParam }) => {
      const res = await client.get("/api/agencies", {
        params: { page: pageParam },
      });
      return {
        nextPage: res.data.next_page_url ? pageParam + 1 : undefined,
        data:
          res.data["data"]?.map(({ id, company_name }) => ({
            value: id,
            label: company_name,
          })) || [],
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const handleChange = (value) => {
    field.onChange(value);
    onAgencySelect(!!value);
    setWebsiteId("");
  };

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
            onChange={handleChange}
            options={items}
            onFetchNextPage={() => hasNextPage && fetchNextPage()}
          />
        </FormControl>
        {fieldConfigItem.description && <FormDescription>{fieldConfigItem.description}</FormDescription>}
      </FormItem>
    </React.Fragment>
  );
};

const MarketingClaimSelector = ({ label, isRequired, field, fieldConfigItem }: AutoFormInputComponentProps) => {
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery({
    queryKey: ["marketing_claims"],
    queryFn: async ({ pageParam }) => {
      const res = await client.get("/api/marketing-claim-types", {
        params: { page: pageParam },
      });

      return {
        nextPage: res.data.next_page_url ? pageParam + 1 : undefined,
        data:
          res.data["data"]?.map(({ id, name }) => ({
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
        {fieldConfigItem.description && <FormDescription>{fieldConfigItem.description}</FormDescription>}
      </FormItem>
    </React.Fragment>
  );
};

const WebsiteSelector = ({
  label,
  isRequired,
  field,
  fieldConfigItem,
  agencyId,
  websiteId,
  setWebsiteId,
}: AutoFormInputComponentProps & { agencyId: number; websiteId: string; setWebsiteId: (id: string) => void }) => {
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery({
    queryKey: ["websites", agencyId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await client.get(`/api/agencies/${agencyId}/websites`, {
        params: { page: pageParam },
      });
      return {
        nextPage: res.data.next_page_url ? pageParam + 1 : undefined,
        data:
          res.data["data"]?.map(({ id, name, url }) => ({
            value: id.toString(),
            label: `${url} (${name})`,
          })) || [],
      };
    },
    initialPageParam: 1,
    enabled: !!agencyId, // Only fetch when agencyId is present
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const handleChange = (value) => {
    field.onChange(value);
    setWebsiteId(value);
  };

  const items =
    data?.pages
      ?.flatMap(({ data }) => data)
      .filter((website, index, self) => index === self.findIndex((w) => w.value === website.value)) || [];

  return (
    <React.Fragment>
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <Combobox
            value={websiteId}
            isLoading={isFetching}
            onChange={handleChange}
            options={items}
            onFetchNextPage={() => hasNextPage && fetchNextPage()}
          />
        </FormControl>
        {fieldConfigItem.description && <FormDescription>{fieldConfigItem.description}</FormDescription>}
      </FormItem>
    </React.Fragment>
  );
};
