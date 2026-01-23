import DetailsForm from "@/components/ui/details-form";
import {z} from "zod";
import {useDetailsPageHook} from "@/hooks/useDetailsPageHook.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {client} from "@/axios.ts";
import {useState} from "react";
import {UseFormReturn} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {Agency} from "../type";

const formSchema = z.object({
    company_name: z
        .string()
        .min(1, "Company name is required")
        .describe("Company name"),
    bank_name: z.string().min(1, "Bank name is required").describe("Bank name"),
    account_number: z.string().describe("Bank account number"),
    contact_person: z.string().describe("Contact person"),
    email: z.string().email().describe("Contact person email"),
    phone: z.number() .describe("Contact person phone number"),

});

export function AgencyDetails() {
    const {isCreateMode, id, isEditMode} = useDetailsPageHook();
    const [form, setForm] = useState<UseFormReturn>();
    const navigate = useNavigate();
    const [defaultFormValue, setDefaultFormValue] =
        useState<Record<string, any>>();

    useQuery({
        enabled: Boolean(id),
        queryKey: ["agency_details"],
        queryFn: async () => {
            const res = await client.get(`/api/agencies/${id}`);
            form.reset(res.data);
            setDefaultFormValue(res.data);
            return res.data;
        },
    });

    const {mutateAsync: createBranch, isPending: isCreating} = useMutation({
        mutationKey: ["create_agency"],
        onSuccess: () => navigate(-1),
        mutationFn: async (data: Partial<Omit<Agency, "id">>) => {
            const res = await client.post(`/api/agencies`, data);
            return res.data;
        },
    });

    const {mutateAsync: updateBranch, isPending: isUpdating} = useMutation({
        onSuccess: () => navigate(-1),
        mutationKey: ["update_agency"],
        mutationFn: async (data: Partial<Agency>) => {
            const res = await client.patch(`/api/agencies/${data?.id}`, data);
            return res.data;
        },
    });

    return (
        <DetailsForm
            title={"Agency Details"}
            isLoading={isUpdating || isCreating}
            formSchema={formSchema}
            getFormReferences={setForm}
            defaultValueOverride={defaultFormValue}
            onSubmit={async (data) => {
                if (isEditMode) await updateBranch({id: Number(id), ...data});
                if (isCreateMode) await createBranch(data);
            }}
            fieldConfig={{
                company_name: {inputProps: {placeholder: "Company name"}},
                bank_name: {inputProps: {placeholder: "Bank name"}},
                account_number: {inputProps: {placeholder: "Bank account name"}},
                contact_person: {inputProps: {placeholder: "Contact person"}},
                email: {inputProps: {placeholder: "Contact person email"}},
                phone: {inputProps: {placeholder: "Contact person phone number"}},
            }}
            breadcrumbs={[
                {title: "Home", path: "/"},
                {title: "Agency", path: "/agency"},
                {
                    title: isCreateMode ? "Create new agency" : "Edit agency information",
                },
            ]}
        />
    );
}
