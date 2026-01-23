import {client} from "@/axios";
import {useInfiniteQuery} from "@tanstack/react-query";
import {CheckboxDropdown} from "./ui/checkbox-dropdown";

export default function MarketingClaimTypesSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const {data, fetchNextPage, isLoading} = useInfiniteQuery({
    gcTime: 0,
    queryKey: ["marketing_claim_types_selector"],
    queryFn: async ({pageParam}) => {
      if (!pageParam) return {nextPage: undefined, data: []};
      const res = await client.get("/api/marketing-claim-types", {
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
          isLoading
            ? []
            : data?.pages
                ?.flatMap(({data}) => data)
                ?.map(({value, label}) => ({value, name: label})) || []
        }
        isLoading={isLoading}
      />
    </>
  );
}
