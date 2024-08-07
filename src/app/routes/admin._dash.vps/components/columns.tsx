import { ColumnDef, flexRender } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ComputeData = {
  id: string;
  contaboId: string;
  registrationDate: string;
  domain: string | null;
  domainPointers: "not_set" | "error" | "success";
  ipv4: string;
  ipv4PointsTo: string | null;
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
    accessorKey: "ipv4PointsTo",
    header: "IPV4 Points To",
    // cell: (x) => (
    //   <div className="text-right">
    //     <button onClick={() => {}} >
    //       {flexRender(x.column.columnDef.cell, x.cell.getContext())}
    //     </button>
    //   </div>
    // ),
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
