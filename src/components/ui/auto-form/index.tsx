"use client";
import {Form} from "@/components/ui/form";
import React from "react";
import {DefaultValues, UseFormReturn, useForm} from "react-hook-form";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {zodResolver} from "@hookform/resolvers/zod";

import AutoFormObject from "./fields/object";
import {Dependency, FieldConfig} from "./types";
import {
  ZodObjectOrWrapped,
  getDefaultValues,
  getObjectFormSchema,
} from "./utils";
import {createContext, useContext} from "react";

export function AutoFormSubmit({
  children,
  className,
  disabled,
}: {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" disabled={disabled} className={className}>
      {children ?? "Submit"}
    </Button>
  );
}

const AutoFormProvider = createContext<{
  form: UseFormReturn;
  isDirty: boolean;
}>({} as any);

export const useAutoFormProvider = () => useContext(AutoFormProvider);

function isPristine(obj: Record<string, any>) {
  return Object.values(obj).every((values) => {
    if (typeof values === "object") return isPristine(values);
    return values?.length === 0 || values === null || values === undefined;
  });
}

export type TAutoFormProps<SchemaType extends ZodObjectOrWrapped> = {
  formSchema: SchemaType;
  values?: Partial<z.infer<SchemaType>>;
  onValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onParsedValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onSubmit?: (values: z.infer<SchemaType>) => void;
  fieldConfig?: FieldConfig<z.infer<SchemaType>>;
  children?: React.ReactNode;
  className?: string;
  dependencies?: Dependency<z.infer<SchemaType>>[];
  getFormReferences?: (form: UseFormReturn) => void;
  defaultValueOverride?: DefaultValues<z.infer<any>>;
};

function AutoForm<SchemaType extends ZodObjectOrWrapped>({
  formSchema,
  values: valuesProp,
  onValuesChange: onValuesChangeProp,
  onParsedValuesChange,
  onSubmit: onSubmitProp,
  fieldConfig,
  getFormReferences,
  children,
  defaultValueOverride,
  className,
  dependencies,
}: TAutoFormProps<SchemaType>) {
  const objectFormSchema = getObjectFormSchema(formSchema);
  const defaultValues: DefaultValues<z.infer<typeof objectFormSchema>> | null =
    defaultValueOverride ?? getDefaultValues(objectFormSchema, fieldConfig);

  const form = useForm<z.infer<typeof objectFormSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? undefined,
    values: valuesProp,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) {
      onSubmitProp?.(parsedValues.data);
    }
  }

  const values = form.watch();
  // valuesString is needed because form.watch() returns a new object every time
  const valuesString = JSON.stringify(values);

  React.useEffect(() => {
    if (getFormReferences && form) getFormReferences(form);
    onValuesChangeProp?.(values);
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) onParsedValuesChange?.(parsedValues.data);
  }, [valuesString]);

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            form.handleSubmit(onSubmit)(e);
          }}
          className={cn("space-y-5", className)}
        >
          <AutoFormObject
            schema={objectFormSchema}
            form={form}
            dependencies={dependencies}
            fieldConfig={fieldConfig}
          />

          <AutoFormProvider.Provider
            value={{
              form,
              isDirty:
                JSON.stringify(defaultValues) !==
                (isPristine(values) ? "{}" : valuesString),
            }}
          >
            {children}
          </AutoFormProvider.Provider>
        </form>
      </Form>
    </div>
  );
}

export default AutoForm;
