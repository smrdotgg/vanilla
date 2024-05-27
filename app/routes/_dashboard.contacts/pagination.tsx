/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLoaderData, useLocation, useSearchParams } from "@remix-run/react";
import { loader, urlToOffsetAndBatch } from "./route";

const maxConsecutiveBatchDisplay = 10;
export const ContactsPagination = () => {
  const { page, batchSize, pageCount } = useLoaderData<typeof loader>();

  // const [searchParams] = useSearchParams();
  // const {page, } = urlToOffsetAndBatch(searchParams);

  return <div>{page.toString()}</div>;

  // url = {JSON.stringify(url)}
  return (
    <>
      location = {JSON.stringify(location)}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious to="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink to="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink to="#">
              <PaginationEllipsis />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext to="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

const PreviousPages = ({
  pageToUrl,
  currentPage,
}: {
  pageToUrl: (page: number) => string;
  currentPage: number;
}) => {
  if (currentPage == 1) return <></>;

  return (
    <div className="flex">
      <PaginationItem>
        <PaginationLink to={pageToUrl(1)}>1</PaginationLink>
      </PaginationItem>
      {currentPage - 1 > maxConsecutiveBatchDisplay ? (
        <>
          <PaginationItem>
            <PaginationLink to="#">
              <PaginationEllipsis />
            </PaginationLink>
          </PaginationItem>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

const CurrentPage = ({ content }: { content: number }) => {
  return (
    <PaginationItem>
      <PaginationLink to="#">{String(content)}</PaginationLink>
    </PaginationItem>
  );
  // <PaginationItem>
  //     <PaginationLink href="#">1</PaginationLink>
  //   </PaginationItem>
};
