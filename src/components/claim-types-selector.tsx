import {client} from "@/axios";
import {useInfiniteQuery} from "@tanstack/react-query";
import {CheckboxDropdown} from "./ui/checkbox-dropdown";

export default function ClaimTypesSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const {data, fetchNextPage, isLoading} = useInfiniteQuery({
    queryKey: ["claim_types_selector"],
    gcTime: 0,
    queryFn: async ({pageParam}) => {
      if (!pageParam) return {nextPage: undefined, data: []};
      const res = await client.get("/api/claim-types", {
        params: {page: pageParam},
      });

      const existing = data?.pages
        ?.flatMap(({data}) => data)
        ?.find(({value}) => value === res.data["data"][0]?.id);

      return {
        nextPage:
          res.data["data"].length === 0 || existing ? undefined : pageParam + 1,
        data: existing
          ? []
          : res.data["data"]?.map(({id, name}) => ({
              value: id,
              label: name,
            })) || [],
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  return (
    <>
      <CheckboxDropdown
        loadNextPage={fetchNextPage}
        onChange={onChange}
        value={value}
        name={"Claim Type"}
        options={
          data?.pages
            ?.flatMap(({data}) => data)
            ?.map(({value, label}) => ({value, name: label})) || []
        }
        isLoading={isLoading}
      />
    </>
  );
}
