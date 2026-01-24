import {CircleUser, Loader2, LoaderCircle, Menu} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, { useRef } from "react";
import {brand} from "@/lib/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Outlet, useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {GridPattern} from "@/components/grid-pattern.tsx";
import {LoginPage, useAuth} from "@/auth/LoginPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {useInfiniteQuery, useMutation} from "@tanstack/react-query";
import {toast} from "@/components/ui/use-toast.ts";
import {client} from "@/axios.ts";
import {
  ALL,
  CanAccess,
  ROLES,
  ROLE_ID,
  ROLE_NAME_MAP,
  useAclify,
} from "@/acl.ts";
import {ResponsiveDrawer} from "../ui/responsive-drawer";
import {z} from "zod";
import AutoForm from "../ui/auto-form";
import {Card} from "../ui/card";
import {AutoFormInputComponentProps} from "../ui/auto-form/types";
import {Label} from "../ui/label";
import {Combobox} from "../ui/combobox";
import {FormItem, FormLabel, FormControl, FormDescription} from "../ui/form";

const modules = [
  {
    id: 1,
    title: "Overview",
    link: "/overview",
    canAccess: ALL,
  },
  {
    id: 4,
    title: "Leave",
    link: "/leave",
    canAccess: ALL,
  },
  {
    id: 5,
    title: "Claims",
    canAccess: ALL,
    children: [
      {
        id: 5,
        title: "General Claims",
        description: "Manage your general claims here.",
        link: "/claim",
        canAccess: ALL,
      },
      {
        id: 6,
        title: "Marketing Claims",
        description: "Manage your marketing claims here.",
        link: "/marketing",
        canAccess: ALL,
      },
    ],
  },
  {
    id: 6,
    title: "Reports",
    canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR, ROLES.CREDIT_OFFICER],
    children: [
      {
        id: 5,
        title: "Claim Reports",
        description: "Export Claims Reports here.",
        link: "/reports/claims",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER],
      },
      {
        id: 6,
        title: "Marketing Claim Reports",
        description: "Export Marketing Claims Reports here.",
        link: "/reports/marketing-claims",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER],
      },
      {
        id: 7,
        title: "Leave Reports",
        description: "Export leave Reports here.",
        link: "/reports/leave",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR],
      },
    ],
  },
  {
    id: 7,
    title: "Settings",
    canAccess: [
      ROLES.BOSS, 
      ROLES.DIRECTOR,
      ROLES.BRANCH_MANAGER,
      ROLES.HR,
      ROLES.CREDIT_OFFICER,
    ],
    children: [
      {
        id: 8,
        title: "User",
        description: "Manage your system users here.",
        link: "/user",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.BRANCH_MANAGER, ROLES.HR],
      },
      {
        id: 10,
        title: "Branch",
        description: "Manage your branch here.",
        link: "/branch",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.BRANCH_MANAGER, ROLES.HR],
      },
      {
        id: 5,
        title: "Claim Types",
        description: "Upate or add new claim types here.",
        link: "/claim-types",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER],
      },
      {
        id: 6,
        title: "Marketing Claims Types",
        description: "Upate or add new marketing types here.",
        link: "/marketing-types",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER],
      },
      {
        id: 7,
        title: "Marketing Agencies",
        description: "Add new agencies here",
        link: "/agency",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER],
      },
      {
        id: 9,
        title: "Teams",
        description: "Manage your team here",
        link: "/team",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR],
      },
      {
        id: 11,
        title: "Websites",
        description: "Manage your website here",
        link: "/website",
        canAccess: [ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR],
      },
    ],
  },
];

function LayoutTitle() {
  return (
    <a
      href="#"
      className="flex items-center gap-2 text-lg font-semibold md:text-base  w-[95px]"
    >
      <img src={brand.logo} alt={"logo"} />
    </a>
  );
}

export function MainLayout() {
  const {setUser} = useAclify();
  const {mutateAsync: logout, isPending} = useMutation({
    mutationKey: ["logout"],
    onError() {
      toast({
        title: "Oops something went wrong",
        description: "Please try again later",
      });
    },
    mutationFn: async () => {
      return await client.post(`/logout`).then(() => setUser(undefined));
    },
  });

  return (
    <LoginPage>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between w-full z-50 ">
          <NavigationHeader />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden h-8 w-8"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className={"overflow-y-auto max-h-[100vh]"}
            >
              <nav className="grid gap-6 text-lg font-medium">
                <LayoutTitle />
                {modules.map((module) => {
                  const Root = module?.canAccess ? CanAccess : React.Fragment;
                  return (
                    <Root key={module.id} roles={module.canAccess}>
                      {!module?.children && (
                        <Link
                          to={module.link}
                          className={cn(
                            "transition-colors text-primary text-sm hover:underline"
                          )}
                        >
                          {module.title}
                        </Link>
                      )}
                      {module?.children && (
                        <React.Fragment>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem value="item-1">
                              <AccordionTrigger>
                                {module.title}
                              </AccordionTrigger>
                              <AccordionContent className={"flex flex-col p-0"}>
                                {module?.children.map((child) => {
                                  const Root = module?.canAccess
                                    ? CanAccess
                                    : React.Fragment;
                                  return (
                                    <Root
                                      key={child.id}
                                      roles={child.canAccess}
                                    >
                                      <ListItem
                                        href={child.link}
                                        title={child.title}
                                        key={child.id}
                                      >
                                        {child.description}
                                      </ListItem>
                                    </Root>
                                  );
                                })}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </React.Fragment>
                      )}
                    </Root>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ResponsiveDrawer
                  title={"Your Account"}
                  description={"See your account information here"}
                  trigger={
                    <Button
                      className="w-full justify-start h-8 ps-2"
                      variant="ghost"
                    >
                      Account
                    </Button>
                  }
                >
                  <AccountDialog />
                </ResponsiveDrawer>
                <DropdownMenuItem
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  {isPending && (
                    <Loader2 className={"animate-spin h-4 w-4 me-2"} />
                  )}
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
          <div className="fixed inset-x-0 top-0 -z-10 h-screen w-screen overflow-hidden rounded-t-4xl bg-gradient-to-b from-background">
            <GridPattern className="inset-0 h-full w-full fill-muted stroke-muted dark:[mask-image:linear-gradient(to_top_left,black_40%,transparent_50%)] [mask-image:linear-gradient(to_top_left,white_40%,transparent_50%)]" />
          </div>
        </main>
      </div>
    </LoginPage>
  );
}

export function NavigationHeader() {
  return (
    <div className={"space-x-4 hidden md:flex"}>
      <LayoutTitle />
      <NavigationMenu>
        <NavigationMenuList>
          {modules.map((module) => {
            const Root = module?.canAccess ? CanAccess : React.Fragment;
            return (
              <Root key={module.id} roles={module.canAccess}>
                <NavigationMenuItem key={module?.id}>
                  {!module?.children && (
                    <NavigationMenuLink asChild>
                      <Link
                        to={module?.link}
                        className={navigationMenuTriggerStyle()}
                      >
                        {module.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                  {module?.children && (
                    <React.Fragment>
                      <NavigationMenuTrigger>
                        {module.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-2 grid-cols-1 lg:grid-cols-2 p-2 pb-2.5 md:w-[600px]">
                          {module?.children.map((child) => {
                            const Root = module?.canAccess
                              ? CanAccess
                              : React.Fragment;
                            return (
                              <Root key={child.id} roles={child.canAccess}>
                                <NavigationMenuLink asChild key={child.id}>
                                  <ListItem
                                    href={child.link}
                                    title={child.title}
                                  >
                                    {child.description}
                                  </ListItem>
                                </NavigationMenuLink>
                              </Root>
                            );
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </React.Fragment>
                  )}
                </NavigationMenuItem>
              </Root>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({className, title, children, ...props}, ref) => {
  return (
    <Link
      to={props.href}
      ref={ref}
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      <div className="text-sm font-medium leading-none">{title}</div>
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
        {children}
      </p>
    </Link>
  );
});

const form_validation = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .describe("First Name"),
  last_name: z.string().min(1, "Last name is required").describe("Last Name"),
  email: z.string().email("Please enter a valid email").describe("Email"),
  phone: z
    .string()
    .regex(
      /^(01[0-9]-?\d{7,8}|0[3-9]-?\d{7,8})$/,
      "Please enter a valid phone number"
    )
    .min(1, "Phone required")
    .describe("Phone Number"),
  settings: z
    .object({
      role_id: z.string().describe("User Role"),
      branch_id: z
        .number()
        .int("Please select a valid branch")
        .describe("User Branch"),
    })
    .describe("User Settings"),
  leave: z
    .object({
      annual_leave: z.coerce
        .number()
        .int("Please enter a valid number")
        .describe("Annual Leaves"),
      medical_leave: z.coerce
        .number()
        .int("Please enter a valid number")
        .describe("Medical Leave"),
      maternity_leave: z.coerce
        .number()
        .int("Please enter a valid number")
        .describe("Maternity Leave"),
      paternity_leave: z.coerce
        .number()
        .int("Please enter a valid number")
        .describe("Paternity Leave"),
      birthday_leave: z.coerce
        .number()
        .int("Please enter a valid number")
        .max(1, "Birthday must not be greater than 1")
        .describe("Birthday Leave"),
    })
    .describe("User Leaves"),
});

const passwordSchema = z.object({
  passwordForm: z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    password_confirmation: z.string().min(6, "Password confirmation must be at least 6 characters long"),
  }),
}).refine(data => data.passwordForm.password === data.passwordForm.password_confirmation, {
  message: "Passwords must match",
  path: ["passwordForm", "password_confirmation"],
});


function AccountDialog() {
  const {user} = useAuth();

  return (
    <>
      <AccountDetailsForm user={user} />
      <PasswordForm user={user} />
    </>
  );
}

function PlaceholderValue({label, value}: {label: string; value: string}) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-base text-muted-foreground">{value}</p>
    </div>
  );
}

const BranchSelector = ({
  label,
  isRequired,
  field,
  fieldConfigItem,
}: AutoFormInputComponentProps) => {
  const {data, fetchNextPage, isFetching} = useInfiniteQuery({
    queryKey: ["branches"],
    queryFn: async ({pageParam}) => {
      const res = await client.get("/api/branches", {
        params: {page: pageParam},
      });
      return {
        nextPage: pageParam + 1,
        data:
          res.data["data"]?.map(({id, name}) => ({
            value: id,
            label: name,
          })) || [],
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <React.Fragment>
      <FormItem className="flex flex-col">
        <FormLabel>
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </FormLabel>
        <FormControl>
          <Combobox
            disabled
            value={field.value}
            isLoading={isFetching}
            onChange={field.onChange}
            options={data?.pages?.flatMap(({data}) => data) || []}
            onFetchNextPage={fetchNextPage}
          />
        </FormControl>
        {fieldConfigItem.description && (
          <FormDescription>{fieldConfigItem.description}</FormDescription>
        )}
      </FormItem>
    </React.Fragment>
  );
};

function AccountDetailsForm({ user }) {
  return (
    <AutoForm
      className="sm:p-0 p-4"
      formSchema={form_validation}
      defaultValueOverride={user}
      fieldConfig={{
        first_name: {
          inputProps: { placeholder: "Enter first name" },
          renderParent: ({ children }) => (
            <div className={"col-span-3"}>{children}</div>
          ),
          fieldType: (item: AutoFormInputComponentProps) => (
            <PlaceholderValue label={item?.label} value={item?.field.value} />
          ),
        },
        last_name: {
          inputProps: { placeholder: "Enter last name" },
          renderParent: ({ children }) => (
            <div className={"col-span-3"}>{children}</div>
          ),
          fieldType: (item: AutoFormInputComponentProps) => (
            <PlaceholderValue label={item?.label} value={item?.field.value} />
          ),
        },
        email: {
          inputProps: { placeholder: "Enter email" },
          fieldType: (item: AutoFormInputComponentProps) => (
            <PlaceholderValue label={item?.label} value={item?.field.value} />
          ),
        },
        phone: {
          inputProps: { placeholder: "Enter phone number" },
          fieldType: (item: AutoFormInputComponentProps) => (
            <PlaceholderValue label={item?.label} value={item?.field.value} />
          ),
        },
        settings: {
          role_id: {
            inputProps: { placeholder: "Select user role" },
            fieldType: (item: AutoFormInputComponentProps) => (
              <PlaceholderValue
                label={item?.label}
                value={ROLE_NAME_MAP[ROLE_ID[item?.field.value]]}
              />
            ),
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
          annual_leave: {
            inputProps: { placeholder: "Enter annual leave" },
            fieldType: (item: AutoFormInputComponentProps) => (
              <PlaceholderValue label={item?.label} value={item?.field.value} />
            ),
          },
          medical_leave: {
            inputProps: { placeholder: "Enter medical leave" },
            fieldType: (item: AutoFormInputComponentProps) => (
              <PlaceholderValue label={item?.label} value={item?.field.value} />
            ),
          },
          maternity_leave: {
            inputProps: { placeholder: "Enter maternity leave" },
            fieldType: (item: AutoFormInputComponentProps) => (
              <PlaceholderValue label={item?.label} value={item?.field.value} />
            ),
          },
          paternity_leave: {
            inputProps: { placeholder: "Enter paternity leave" },
            fieldType: (item: AutoFormInputComponentProps) => (
              <PlaceholderValue label={item?.label} value={item?.field.value} />
            ),
          },
          birthday_leave: {
            inputProps: { placeholder: "Enter birthday leave" },
            fieldType: (item: AutoFormInputComponentProps) => (
              <PlaceholderValue label={item?.label} value={item?.field.value} />
            ),
          },
          renderParent: ({ children }) => {
            return <Card className={"px-4 col-span-6"}>{children}</Card>;
          },
        },
      }}
    />
  );
}


function PasswordForm({ user }) {
  const navigate = useNavigate();
  const formValuesRef = useRef({ password: "", password_confirmation: "" });

  const { mutateAsync, isPending: isLoading } = useMutation({
    mutationKey: ["password"],
    onError: (d) =>
      toast({
        title: "An Error has occurred",
        description: (d as any)?.response?.data?.message,
      }),
      onSuccess: () => {
        navigate('/');
        window.location.reload();

        toast({
          title: "Password updated",
          description: 'Password updated successfully',
        });
      },
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const { password, password_confirmation } = data.passwordForm;
      return await client.put(`/api/users/${user.id}`, {
        password,
        password_confirmation,
      });
    },
  });

  const handleValuesChange = (values) => {
    formValuesRef.current = values.passwordForm;
  };

  return (
    <AutoForm
      className="sm:p-0 p-4"
      formSchema={passwordSchema}
      defaultValueOverride={{ passwordForm: { password: "", password_confirmation: "" } }}
      onSubmit={async (v: z.infer<typeof passwordSchema>) => await mutateAsync(v)}
      onValuesChange={handleValuesChange}
      fieldConfig={{
        passwordForm: {
          password: {
            inputProps: {
              placeholder: "Enter password",
              type: "password",
            },
          },
          password_confirmation: {
            inputProps: {
              placeholder: "Enter password confirmation",
              type: "password",
            },
          },
          renderParent: ({ children }) => {
            const { password, password_confirmation } = formValuesRef.current;
            const canShowSubmit = password.trim() !== "" && password_confirmation.trim() !== "";

            return (
              <Card className={"px-4 col-span-6 pb-6"}>
                {children}
                {
                  canShowSubmit &&
                  <Button type="submit">
                    {isLoading && (
                      <LoaderCircle className={"animate-spin h-4 w-4 me-1"} />
                    )}
                    Submit
                  </Button>
                }
              </Card>
            );
          },
        },
      }}
    />
  );
}