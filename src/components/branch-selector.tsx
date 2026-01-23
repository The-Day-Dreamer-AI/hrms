import {client} from "@/axios";
import {useInfiniteQuery} from "@tanstack/react-query";
import {CheckboxDropdown} from "./ui/checkbox-dropdown";
import {useState} from "react";

export default function BranchSelector({
  value,
  onChange,
  selectOne,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  selectOne?: boolean;
}) {
  const [search, setSearch] = useState();
  const {data, fetchNextPage, isLoading} = useInfiniteQuery({
    queryKey: ["combobox_branch", search],
    queryFn: async ({pageParam}) => {
      if (!pageParam) return {nextPage: undefined, data: []};
      const res = await client.get("/api/branches", {
        params: {page: pageParam, search},
      });
      return {
        nextPage: res.data["data"].length === 0 ? undefined : pageParam + 1,
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
    <>
      <CheckboxDropdown
        onSearchChange={(a) => setSearch(a)}
        loadNextPage={fetchNextPage}
        selectOne={selectOne}
        onChange={onChange}
        value={value}
        name={"Branch"}
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
