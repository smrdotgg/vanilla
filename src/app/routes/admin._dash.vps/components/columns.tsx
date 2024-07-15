import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ComputeData = {
  id: string;
  contaboId: string;
  registrationDate: string;
  domain: string | null;
  domainPointers: "not_set" | "error" | "success";
};

export const columns: ColumnDef<ComputeData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "contaboId",
    header: "Contabo ID",
  },
  {
    accessorKey: "registrationDate",
    header: "Registration Date",
  },
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "domainPointers",
    header: "Domain Pointers State",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: () => (
      <div className="text-right">
        <button onClick={() => {}} className="text-red-500 hover:text-red-700">
          Delete
        </button>
      </div>
    ),
  },
];
