import { Link } from "@remix-run/react";
import { IoAdd } from "react-icons/io5";
import type { IconType } from "react-icons/lib";
import { Button } from "~/components/ui/button";

type SummaryProps = SummaryCellProps[];

export function Summary({ data }: { data: SummaryProps }) {
  return (
    <div className="flex">
      <div className="flex border border-gray-200 dark:border-gray-700">
        {data.map((datum, index) => (
          <div key={index} className="flex">
            <SummaryCell
              addHref={datum.addHref}
              digit={datum.digit}
              icon={datum.icon}
              label={datum.label}
            />
            {index === data.length - 1 ? (
              <></>
            ) : (
              <div className="h-full w-[.5px] bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type SummaryCellProps = {
  icon: IconType;
  label: string;
  digit: number;
  addHref: string;
};

function SummaryCell(props: {
  icon: IconType;
  label: string;
  digit: number;
  addHref: string;
}) {
  return (
    <div className="mx-8 flex justify-center gap-4  py-3 align-middle *:m-auto">
      <div className="rounded-full bg-gray-50 dark:bg-gray-700">
        <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-900">
          <props.icon className=" h-5 w-5" />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-semibold">{props.digit.toString()}</p>
        <p className="text-xs text-gray-500">{props.label}</p>
      </div>
      <Button asChild variant="outline" className="h-6 w-6 rounded-none p-0">
        <Link to="#" className="">
          <IoAdd className="" />
        </Link>
      </Button>
    </div>
  );
}
