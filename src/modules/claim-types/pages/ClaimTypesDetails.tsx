import {z} from "zod";
import {useMutation, useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDetailsPageHook} from "@/hooks/useDetailsPageHook.ts";
import {client} from "@/axios.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {UseFormReturn} from "react-hook-form";
import DetailsForm from "@/components/ui/details-form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").describe("Claim Type"),
  default_limit: z
    .number({message: "Please enter a valid number"})
    .describe("Claim Limit"),
});

export function ClaimTypesDetails() {
  const {toast} = useToast();
  const [defaultFormValues, setDefaultFormValues] = useState({});
  const navigate = useNavigate();
  const {id, isEditMode, isCreateMode} = useDetailsPageHook();
  const [form, setForm] = useState<UseFormReturn>();

  const {mutateAsync: updateType, isPending: isUpdating} = useMutation({
    mutationKey: ["put_claim_types"],
    mutationFn: async ({
      name,
      default_limit,
    }: {
      name: string;
      default_limit: string;
    }) => {
      try {
        const res = await client.put(`/api/claim-types/${id}`, {
          default_limit,
          name,
        });
        navigate("/claim-types");
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

  const {mutateAsync: addType, isPending: isAdding} = useMutation({
    mutationKey: ["post_claim_types"],
    mutationFn: async ({
      name,
      default_limit,
    }: {
      name: string;
      default_limit: string;
    }) => {
      try {
        const res = await client.post(`/api/claim-types`, {
          default_limit,
          name,
        });
        toast({
          title: "Claim type added",
          description: "Your claim type has been added successfully!",
        });
        navigate("/claim-types");
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
    queryKey: ["get_claim_type"],
    enabled: Boolean(id),
    queryFn: async () => {
      const claimItem = await client.get(`/api/claim-types/${id}`, {});
      form.reset(claimItem.data.data, {keepDirty: false});
      setDefaultFormValues(claimItem.data.data);
      return claimItem?.data;
    },
  });

  return (
    <DetailsForm
      title={isCreateMode ? "Create new claim type" : "Edit claim type"}
      breadcrumbs={[
        {title: "Home", path: "/"},
        {title: "Claim Types", path: "/claim-types"},
        {title: isCreateMode ? "Create new claim type" : "Edit claim type"},
      ]}
      isLoading={isUpdating || isAdding}
      getFormReferences={(form) => setForm(form)}
      defaultValueOverride={defaultFormValues}
      formSchema={formSchema}
      className={"mt-4"}
      fieldConfig={{
        default_limit: {inputProps: {placeholder: "Enter claim type limit"}},
        name: {inputProps: {placeholder: "Enter claim type name"}},
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
