import {Checkbox} from "./ui/checkbox";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";

const placeholderData = {id: 1, data: [1, 2, 3, 5, 6, 7, 8, 9]};
export function XLSXTable({
  header,
  isLoading = false,
  onSelectCheckbox,
  selectedId,
  data,
}: {
  header: string[];
  data: {id: string; data: any[]}[];
  isLoading: boolean;
  selectedId: string[];
  onSelectCheckbox: (id: string[]) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox
              checked={data?.length === selectedId?.length}
              onClick={() =>
                onSelectCheckbox(
                  data?.length === selectedId?.length
                    ? []
                    : data?.map((a) => a.id)
                )
              }
            />
          </TableHead>
          {(!isLoading ? header : placeholderData)?.map((title, index) => (
            <TableHead key={index}>
              {isLoading ? (
                <div className="w-[100px] bg-muted text-muted animate-pulse rounded">
                  asdasd
                </div>
              ) : (
                title
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.length === 0 && (
          <TableRow>
            <TableCell colSpan={header?.length}>
              <div className="text-center p-4">No records available</div>
            </TableCell>
          </TableRow>
        )}
        {(!isLoading
          ? data
          : [
              placeholderData,
              placeholderData,
              placeholderData,
              placeholderData,
              placeholderData,
              placeholderData,
              placeholderData,
              placeholderData,
            ]
        )?.map((cols, index) => (
          <TableRow key={index}>
            <TableCell>
              <Checkbox
                checked={selectedId?.includes(cols.id)}
                onClick={() =>
                  onSelectCheckbox(
                    selectedId.includes(cols.id)
                      ? selectedId?.filter((item) => item !== cols.id)
                      : [...selectedId, cols.id]
                  )
                }
              />
            </TableCell>
            {cols["data"].map((title, index) => (
              <TableCell key={index}>
                {isLoading ? (
                  <div className="w-[100px] bg-muted text-muted animate-pulse rounded">
                    asdasd
                  </div>
                ) : (
                  title
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
