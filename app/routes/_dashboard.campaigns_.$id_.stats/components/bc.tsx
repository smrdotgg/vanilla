import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@remix-run/react";

type BreadCrumbItemData = {
  name: string | null;
  href?: string;
  prefetch?: "intent" | "none" | "render" | "viewport";
};

export function MyBreadCrumb({ data }: { data: BreadCrumbItemData[] }) {
  const prevLinks = data.filter((d) => d.href);
  const currentLink = data.find((d) => !d.href);
  const prevLinkComponents = prevLinks.map((pl, index) => (
    <BreadcrumbItem key={index} >
      <BreadcrumbLink asChild href={pl.href}>
      <Link to={pl.href ?? "#"} prefetch={pl.prefetch}>
      {pl.name}
      </Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  ));
  const alteredNumbers = prevLinkComponents.flatMap((num, index) =>
    index < prevLinkComponents.length - 1
      ? [num, <BreadcrumbSeparator key={index}  />]
      : num,
  );
  const lastComponent = currentLink === undefined ? undefined : <BreadcrumbItem>
            <BreadcrumbPage className={currentLink.name ? "" : "font-mono"}>{currentLink.name ?? "[Name Not Set]"}</BreadcrumbPage>
          </BreadcrumbItem>;
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {alteredNumbers}
          {lastComponent && alteredNumbers.length && <BreadcrumbSeparator />}
          {lastComponent}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
