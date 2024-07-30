import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ComputeData = {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string;
  subdomain: string;
  parentDomain: string;
  email: string;
  smtp: {
    server: string;
    port: number;
    security: string;
  };
  imap: {
    server: string;
    port: number;
    security: string;
  };
  hardware: {
    ip: string;
  };
};

// FirstName,LastName,Username,Domain,Email,
//
// SMTP Server,SMTP Port,SMTP Security
// IMAP Server,IMAP Port,IMAP Security
//
// Password

export const columns: ColumnDef<ComputeData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    columns: [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
    ],
  },
  {
    accessorKey: "domain",
    header: "Email Address",
    columns: [
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorFn: (x) => {
          return x.subdomain;
        },
        header: "Prefix",
      },
      {
        accessorKey: "parentDomain",
        header: "Parent",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
    ],
  },

  {
    accessorKey: "imap",
    header: "Hardware",
    columns: [
      {
        accessorFn: (x) => x.hardware.ip,
        header: "IP",
      },
    ],
  },
  {
    accessorKey: "smtp",
    header: "SMTP",
    columns: [
      {
        accessorFn: (x) => "mail." + x.smtp.server,
        header: "Server",
      },
      {
        accessorFn: (x) => x.smtp.port,
        header: "Port",
      },
      {
        accessorFn: (x) => x.smtp.security,
        header: "Securty",
      },
    ],
  },
  {
    accessorKey: "imap",
    header: "IMAP",
    columns: [
      {
        accessorFn: (x) => "mail." + x.smtp.server,
        header: "Server",
      },
      {
        accessorFn: (x) => x.imap.port,
        header: "Port",
      },
      {
        accessorFn: (x) => x.imap.security,
        header: "Security",
      },
    ],
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
