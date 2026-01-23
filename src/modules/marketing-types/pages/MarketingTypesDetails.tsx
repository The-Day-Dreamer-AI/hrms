import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDetailsPageHook } from "@/hooks/useDetailsPageHook.ts";
import { client } from "@/axios.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { UseFormReturn } from "react-hook-form";
import DetailsForm from "@/components/ui/details-form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").describe("Marketing claim type"),
  default_limit: z
    .number({ message: "Please enter a valid number" })
    .describe("Claim limit"),
});

export function MarketingTypesDetails() {
  const { toast } = useToast();
  const [defaultFormValues, setDefaultFormValues] = useState({});
  const navigate = useNavigate();
  const { id, isEditMode, isCreateMode } = useDetailsPageHook();
  const [form, setForm] = useState<UseFormReturn>();

  const { mutateAsync: updateType, isPending: isUpdating } = useMutation({
    mutationKey: ["put_marketing_claim_types"],
    mutationFn: async ({
      name,
      default_limit,
    }: {
      name: string;
      default_limit: string;
    }) => {
      try {
        const res = await client.put(`/api/marketing-claim-types/${id}`, {
          default_limit,
          name,
        });
        navigate("/marketing-types");
        toast({
          title: "Claim type updated.",
          description: "Your claim type has been updated successfully!",
        });
        return res;
      } catch (e) {
        toast({
          title: "An error has occurred.",
          description: "Please try again later.",
        });
        return {};
      }
    },
  });

  const { mutateAsync: addType, isPending: isAdding } = useMutation({
    mutationKey: ["post_marketing_claim_types"],
    mutationFn: async ({
      name,
      default_limit,
    }: {
      name: string;
      default_limit: string;
    }) => {
      try {
        const res = await client.post(`/api/marketing-claim-types`, {
          default_limit,
          name,
        });
        toast({
          title: "Claim type added",
          description: "Your claim type has been added successfully!",
        });
        navigate("/marketing-types");
        return res;
      } catch (error) {
        toast({
          title: "An error has occurred.",
          description: "Please try again later.",
        });
        return {};
      }
    },
  });

  useQuery({
    queryKey: ["get_marketing_claim_type"],
    enabled: Boolean(id),
    queryFn: async () => {
      const claimItem = await client.get(
        `/api/marketing-claim-types/${id}`,
        {}
      );
      form.reset(claimItem.data.data, { keepDirty: false });
      setDefaultFormValues(claimItem.data.data);
      return claimItem?.data;
    },
  });

  return (
    <DetailsForm
      title={
        isCreateMode
          ? "Create new marketing claim type"
          : "Edit marketing claim type"
      }
      breadcrumbs={[
        { title: "Home", path: "/" },
        { title: "Marketing claim types", path: "/marketing-types" },
        {
          title: isCreateMode
            ? "Create new marketing claim type"
            : "Edit marketing claim type",
        },
      ]}
      isLoading={isUpdating || isAdding}
      getFormReferences={(form) => setForm(form)}
      defaultValueOverride={defaultFormValues}
      formSchema={formSchema}
      className={"mt-4"}
      fieldConfig={{
        default_limit: {
          inputProps: { placeholder: "Enter claim type limit" },
        },
        name: { inputProps: { placeholder: "Enter claim type name" } },
      }}
      onSubmit={async (v) => {
        if (isEditMode)
          await updateType({
            name: v.name,
            default_limit: v.default_limit.toString(),
          });
        else if (isCreateMode)
          await addType({
            name: v.name,
            default_limit: v.default_limit.toString(),
          });
      }}
    />
  );
}
