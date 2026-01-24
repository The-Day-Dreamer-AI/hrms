import {client} from "@/axios";
import {GridPattern} from "@/components/grid-pattern.tsx";
import {Button} from "@/components/ui/button";
import {brand} from "@/lib/brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import React from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {toast} from "@/components/ui/use-toast";
import {useAclify, CanAccess, ROLES, ALL} from "@/acl.ts";
import {TUserType} from "@/type.ts";

const AuthContext = React.createContext<{user: any; refetch: () => void}>({});
export const useAuth = () => React.useContext(AuthContext);

export function LoginPage({children}: {children?: React.ReactNode}) {
  const [user, setAddUser] = React.useState(null);
  const {setUser} = useAclify();

  const {mutateAsync, isPending} = useMutation({
    mutationKey: ["login"],
    onError(e) {
      if ((e as any)?.response?.status === 401) {
        toast({
          title: "Invalid credential",
          description: "Please check your credential and try again",
        });
      } else {
        toast({
          title: "Oops something went wrong",
          description: "Please try again later",
        });
      }
    },
    mutationFn: async (data: {email: string; password: string}) => {
      return await client
        .post(`/login?email=${data?.email}&password=${data?.password}`, {})
        .then(() => refetch());
    },
  });

  const {refetch} = useQuery({
    queryKey: ["user"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const response = await client.get("/api/me");
        const userData = response?.data as {data: TUserType};
        setAddUser({
          ...userData.data,
          settings: {
            role_id: userData?.data?.roles[0],
            branch_id: userData?.data?.branch_id,
          },
          leave: {...userData.data},
        });
        setUser(userData.data);
        return userData;
      } catch (err) {
        setUser(null);
        return {};
      }
    },
  });

  return (
    <AuthContext.Provider value={{user, refetch}}>
      <React.Fragment>
        <CanAccess
          roles={ALL}
          fallback={
            <div className="flex items-center justify-center h-screen p-4">
              <header className="fixed top-0 left-0 w-full p-4">
                <img src={brand.logo} alt="logo" className="max-w-[120px]" />
              </header>
              <form
                className="w-full max-w-sm"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const email = form.elements["email"].value;
                  const password = form["password"].value;
                  await mutateAsync({email, password});
                }}
              >
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                      Enter your email below to login to your account.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        disabled={isPending}
                        name="email"
                        placeholder={`me@${brand.domain}`}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        disabled={isPending}
                        id="password"
                        placeholder="Password"
                        type="password"
                        name="password"
                      />
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full" disabled={isPending}>
                      Sign in
                    </Button>
                  </CardFooter>
                </Card>
              </form>
              <div className="fixed inset-x-0 top-0 -z-10 h-screen w-screen overflow-hidden rounded-t-4xl bg-gradient-to-b from-background">
                <GridPattern className="inset-0 h-full w-full fill-muted stroke-muted dark:[mask-image:linear-gradient(to_top_left,black_40%,transparent_50%)] [mask-image:linear-gradient(to_top_left,white_40%,transparent_50%)]" />
              </div>
            </div>
          }
        >
          {children}
        </CanAccess>
      </React.Fragment>
    </AuthContext.Provider>
  );
}
