import DetailsForm from "@/components/ui/details-form";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { date, z } from "zod";
import { DatePicker } from "@/components/ui/date-picker.tsx";
import React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useMutation } from "@tanstack/react-query";
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types.ts";
import dayjs from "dayjs";
import { client } from "@/axios.ts";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast.ts";
import { FileUploader } from "@/components/ui/file-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveTypes, DayCoverage } from "../constants";

const formSchema = z
  .object({
    leave_type: z.nativeEnum(LeaveTypes).describe("Leave Type"),
    day_coverage: z.nativeEnum(DayCoverage).optional().describe("Day Coverage"),
    date_from: z.string().describe("Leave Date Start"),
    date_to: z.string().describe("Leave Date End").optional(),
    reason: z.string().describe("Leave Reason"),
    attachment: z.string().describe("Attachment").optional(),
  })
  .refine(
    (data) => {
      if (data.leave_type === LeaveTypes.medical_leave) {
        return data.attachment !== undefined && data.attachment !== "";
      }
      return true;
    },
    {
      message: "Attachment is required for sick leave",
      path: ["attachment"],
    }
  ).refine(
    (data) => {
      const dateFrom = dayjs(data.date_from);
        const dateTo = dayjs(data.date_to);
      if (data.day_coverage === DayCoverage.full_day) {
        return dateTo.isSame(dateFrom) || dateTo.isAfter(dateFrom);
      } else {
        return dateTo.isSame(dateFrom)
      }
    },
    {
      message: "End date must be the same as or after the start date",
      path: ["date_to"],
    }
  );

export function LeaveDetails() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<UseFormReturn>();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["leave"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        description: (d as any)?.response?.data?.message,
      }),
    onSuccess: () => navigate(-1),
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const start = dayjs(data.date_from);
      const end = data.date_to ? dayjs(data.date_to) : dayjs(data.date_from);
      return await client.post("/api/leaves", {
        leave_type: data.leave_type.toLowerCase().replace(" ", "_"),
        attachment: data?.attachment,
        start_date: start.format("YYYY-MM-DD"),
        end_date: end.format("YYYY-MM-DD"),
        reason: data.reason,
        half_day: data?.day_coverage ? data?.day_coverage.toUpperCase().replace(" ", "") : "",
      });
    },
  });

  const handleDayCoverageChange = (value: DayCoverage, dateFrom: string | null) => {
    if (form) {
      if (value !== DayCoverage.full_day) {
        form.setValue('date_to', dateFrom);
      } else if (dateFrom) {
        form.setValue('date_to', dateFrom, { shouldValidate: true });
      }
    }
  };

  return (
    <React.Fragment>
      <DetailsForm
        getFormReferences={setForm}
            title={"Apply leave"}
        isLoading={isPending}
        formSchema={formSchema}
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Leaves", path: "/leave" },
          { title: "Apply Leave" },
        ]}
        onSubmit={async (v) => await mutateAsync(v)}
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
          leave_type: {
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
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LeaveTypes).map((data) => (
                          <SelectItem
                            className="capitalize"
                            value={data}
                            key={data}
                          >
                            {data}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          day_coverage: {
            fieldType: ({
              label,
              isRequired,
              field,
              fieldConfigItem,
            }: AutoFormInputComponentProps) => {
              if (form && form.getValues("leave_type") !== LeaveTypes.annual_leave) {
                return null;
              }
              const dateFrom = form?.watch("date_from");

              return (
                <FormItem className="">
                  <FormLabel>
                    {label}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleDayCoverageChange(value as DayCoverage, dateFrom);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select Day Coverage" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DayCoverage).map((data) => (
                          <SelectItem
                            className="capitalize"
                            value={data}
                            key={data}
                            disabled={false}
                          >
                            {data}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          reason: {
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
          date_from: {
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
                    <DatePicker
                      date={field.value}
                      setDate={(date) => {
                        field.onChange(date?.toISOString());
                        const dayCoverage = form?.getValues('day_coverage');
                        if (dayCoverage === DayCoverage.full_day) {
                          form.setValue('date_to', date?.toISOString());
                        } else {
                          form.clearErrors()
                          form.setValue('date_to', date?.toISOString(), { shouldValidate: true });
                        }
                      }}
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
          date_to: {
            fieldType: ({
              label,
              field,
              fieldConfigItem,
            }: AutoFormInputComponentProps) => {
              const dateFrom = form?.watch("date_from");
              const isFullDay = form?.watch("day_coverage") === DayCoverage.full_day;

              return (
                <FormItem className="">
                  <FormLabel>
                    {label}
                    {<span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={(date) => {
                        const selectedDate = dayjs(date);
                        const fromDate = dayjs(dateFrom);
                        if (selectedDate.isBefore(fromDate)) {
                          form.setError("date_to", {'message': 'End date should be after start date'});
                        } else {
                          form.clearErrors("date_to");
                          field.onChange(date?.toISOString());
                        }
                      }}
                      disabled={!dateFrom || !isFullDay}
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
