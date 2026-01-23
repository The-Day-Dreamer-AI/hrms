import { AclifyProvider } from "@/acl";
import { TUserType } from "@/type.ts";

export function AclProvider({ children }: { children: React.ReactNode }) {
  return (
    <AclifyProvider
      getUserRoles={(user: TUserType) => {
        return user?.roles;
      }}
      getUserPermissions={(user: TUserType) => user?.permission}
    >
      {children}
    </AclifyProvider>
  );
}
