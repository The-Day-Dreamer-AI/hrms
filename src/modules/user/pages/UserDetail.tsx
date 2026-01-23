import { useDetailsPageHook } from "@/hooks/useDetailsPageHook.ts";
import DetailsForm from "@/components/ui/details-form";
import { Card } from "@/components/ui/card.tsx";
import { z } from "zod";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/axios";
import { useState } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import {
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CanAccess, ROLE_ID, ROLE_NAME_MAP, ROLES } from "@/acl";
import React from "react";
import { Combobox } from "@/components/ui/combobox";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast.ts";

export function UserDetail() {
  const { isCreateMode, id, isEditMode } = useDetailsPageHook();
  const [form, setForm] = useState<UseFormReturn>();
  const [defaultFormValue, setDefaultFormValue] =
    useState<Record<string, any>>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define the change_password schema
const changePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional()
    .describe("Password"),
  password_confirmation: z
    .string()
    .min(8, "Password confirmation must be at least 8 characters long")
    .optional()
    .describe("Confirm Password"),
})
.describe("Update Password")
.refine(data => {
  const { password, password_confirmation } = data;
  if ((password && !password_confirmation) || (!password && password_confirmation)) {
    return false;
  }
  return password === password_confirmation;
}, {
  message: "Both password and confirmation must be provided and match",
  path: ["password_confirmation"],
});

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required").describe("First Name"),
  last_name: z.string().min(1, "Last name is required").describe("Last Name"),
  email: z.string().email("Please enter a valid email").describe("Email"),
  phone: z
    .string()
    .regex(/^(01[0-9]-?\d{7,8}|0[3-9]-?\d{7,8})$/, "Please enter a valid phone number")
    .min(1, "Phone required")
    .describe("Phone Number"),
  settings: z.object({
    role_id: z.string().describe("User Role"),
    branch_id: z.number().int("Please select a valid branch").describe("User Branch"),
  }).describe("User Settings"),
  leave: z.object({
    annual_leave: z.coerce.number().int("Please enter a valid number").describe("Annual Leaves"),
    medical_leave: z.coerce.number().int("Please enter a valid number").describe("Medical Leave"),
    maternity_leave: z.coerce.number().int("Please enter a valid number").describe("Maternity Leave"),
    paternity_leave: z.coerce.number().int("Please enter a valid number").describe("Paternity Leave"),
    birthday_leave: z.coerce.number().int("Please enter a valid number").max(1, "Birthday leave must not be greater than 1").describe("Birthday Leave"),
    compassionate_leave: z.coerce.number().int("Please enter a valid number").describe("Compassionate Leave"),
    unpaid_leave: z.coerce.number().int("Please enter a valid number").describe("Unpaid Leave"),
    other_leave: z.coerce.number().int("Please enter a valid number").describe("Other Leave"),
  }).describe("User Leaves"),
  ...(isCreateMode ? {
    password: z.string().min(1, "Password is required").describe("Password"),
    joined_date: z.date().describe("Joined date"),
  } : {
    change_password: changePasswordSchema,
  }),
});

  const { data } = useQuery({
    queryKey: ["getUserById"],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await client.get(`/api/user/${id}`);
      const respondData = res?.data?.data;
      const updatedData = {
        ...respondData,
        settings: {
          role_id: respondData?.roles[0],
          branch_id: respondData?.branch_id,
        },
        leave: {
          ...respondData,
        },
      };
      form.reset(updatedData);
      setDefaultFormValue(updatedData);
      return updatedData;
    },
  });

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationKey: ["create-user"],
    onSuccess: () => navigate(-1),
    onError: (d) => {
      toast({
        title: "An Error has occurred",
        description: (d as any)?.response?.data?.message,
      });
    },
    mutationFn: async (data: any) => {
      const res = await client.post(`/api/users`, {
        ...data,
        role_id: ROLE_ID[data?.role_id],
        joined_date: dayjs(data?.joined_date).format("YYYY-MM-DD"),
      });
      return res?.data;
    },
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationKey: ["update-user"],
    onSuccess: () => navigate(-1),
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        description: (d as any)?.response?.data?.message,
      }),
    mutationFn: async (data: any) => {
      const res = await client.put(`/api/users/${id}`, {
        ...data,
        role_id: ROLE_ID[data?.role_id],
        password: data?.change_password?.password,
        password_confirmation: data?.change_password?.password_confirmation
      });
      return res?.data;
    },
  });

  return (
    <React.Fragment>
      <DetailsForm
        isLoading={isCreating || isUpdating}
        getFormReferences={setForm}
        defaultValueOverride={defaultFormValue}
        title={isCreateMode ? "Create new user" : "Edit user"}
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Users", path: "/user" },
          { title: isCreateMode ? "Create user" : "Edit user" },
        ]}
        formSchema={formSchema}
        onSubmit={async (v) => {
          if (isEditMode) await updateUser({ ...v, ...v.settings, ...v.leave });
          if (isCreateMode)
            await createUser({ ...v, ...v.settings, ...v.leave });
        }}
        fieldConfig={{
          first_name: {
            inputProps: { placeholder: "Enter first name" },
            renderParent: ({ children }) => (
              <div className={"col-span-3"}>{children}</div>
            ),
          },
          last_name: {
            inputProps: { placeholder: "Enter last name" },
            renderParent: ({ children }) => (
              <div className={"col-span-3"}>{children}</div>
            ),
          },
          email: { inputProps: { placeholder: "Enter email" } },
          phone: { inputProps: { placeholder: "Enter phone number" } },
          password: {
            inputProps: { placeholder: "Enter password", type: "password" },
          },
          settings: {
            role_id: {
              inputProps: { placeholder: "Select user role" },
              fieldType: RolesAssignee,
            },
            branch_id: {
              inputProps: { placeholder: "Select user branch" },
              fieldType: BranchSelector,
            },
            renderParent: ({ children }) => {
              return <Card className={"px-4 col-span-6"}>{children}</Card>;
            },
          },
          leave: {
            annual_leave: { inputProps: { placeholder: "Enter annual leave" } },
            medical_leave: {
              inputProps: { placeholder: "Enter medical leave" },
            },
            maternity_leave: {
              inputProps: { placeholder: "Enter maternity leave" },
            },
            paternity_leave: {
              inputProps: { placeholder: "Enter paternity leave" },
            },
            birthday_leave: {
              inputProps: { placeholder: "Enter birthday leave" },
            },
            compassionate_leave: {
              inputProps: { placeholder: "Enter compassionate leave" },
            },
            unpaid_leave: {
              inputProps: { placeholder: "Enter unpaid leave" },
            },
            other_leave: {
              inputProps: { placeholder: "Enter other leave" },
            },
            renderParent: ({ children }) => {
              return <Card className={"px-4 col-span-6"}>{children}</Card>;
            },
          },
          change_password: {
            password: {
              inputProps: { placeholder: "Enter your password", type: "password" },
            },
            password_confirmation: {
              inputProps: { placeholder: "Re-enter your password", type: "password" },
            },
            renderParent: ({ children }) => {
              return <Card className={"px-4 col-span-6"}>{children}</Card>;
            },
          },
        }}
      />
    </React.Fragment>
  );
}

  const BranchSelector = ({
    label,
    isRequired,
    field,
    fieldConfigItem,
  }: AutoFormInputComponentProps) => {
    const [search, setSearch] = useState<string>();
    const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery({
      queryKey: ["branches", search],
      queryFn: async ({ pageParam }) => {
        const res = await client.get("/api/branches", {
          params: { page: pageParam, search },
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

    const items = data?.pages?.flatMap(({ data }) => data) || []
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

const RolesAssignee = ({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) => {
  const data = JSON.parse(
    localStorage.getItem("__REACT_ACLIFY_USER__") || "{}"
  );
  return (
    <React.Fragment>
      <FormItem>
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={true}
            {...fieldProps}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Select a user role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ROLES).map((role) => (
                <SelectItem
                  className="capitalize"
                  value={role}
                  key={role}
                >
                  {ROLE_NAME_MAP[ROLE_ID[role]]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        {fieldConfigItem.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    </React.Fragment>
  );
};
