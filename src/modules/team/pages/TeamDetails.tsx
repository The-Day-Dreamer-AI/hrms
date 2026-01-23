import DetailsForm from "@/components/ui/details-form";
import {z} from "zod";
import {useDetailsPageHook} from "@/hooks/useDetailsPageHook.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {client} from "@/axios.ts";
import {useState} from "react";
import {UseFormReturn} from "react-hook-form";
import {useNavigate} from "react-router-dom";

const formSchema = z.object({
    name: z.string().describe("Team name"),
});

export function TeamDetails() {
    const {isCreateMode, id, isEditMode} = useDetailsPageHook();
    const [form, setForm] = useState<UseFormReturn>();
    const navigate = useNavigate();
    const [defaultFormValue, setDefaultFormValue] =
        useState<Record<string, string>>();

    useQuery({
        enabled: Boolean(id),
        queryKey: ["team_details"],
        queryFn: async () => {
            const res = await client.get(`/api/teams/${id}`);

            const updatedData = {
                ...res.data,
            };

            form.reset(updatedData);
            setDefaultFormValue(updatedData);
            return res.data;
        },
    });

    const {mutateAsync: createTeam, isPending: isCreating} = useMutation({
        mutationKey: ["create-team"],
        onSuccess: () => navigate(-1),
        mutationFn: async ({
            name,
        }: {
            name: string;
        }) => {
            const res = await client.post(`/api/teams`, {name});
            return res.data;
        },
    });

    const {mutateAsync: updateTeam, isPending: isUpdating} = useMutation({
        onSuccess: () => navigate(-1),
        mutationKey: ["update-team"],
        mutationFn: async ({
            name,
            id,
        }: {
            name: string;
            id: string;
        }) => {
            const res = await client.patch(`/api/teams/${id}`, {
                name
            });
            return res.data;
        },
    });

    return (
        <DetailsForm
            title={"Team Details"}
            isLoading={isUpdating || isCreating}
            formSchema={formSchema}
            getFormReferences={setForm}
            defaultValueOverride={defaultFormValue}
            onSubmit={async ({name}) => {
                if (isEditMode) await updateTeam({id, name});
                if (isCreateMode) await createTeam({name});
            }}
            fieldConfig={{
                name: {inputProps: {placeholder: "Name"}},
            }}
            breadcrumbs={[
                {title: "Home", path: "/"},
                {title: "Team", path: "/team"},
                {
                    title: isCreateMode ? "Create new team" : "Edit team information",
                },
            ]}
        />
    );
}