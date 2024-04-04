import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadCrumbItemData = {
  name: string | null;
  href?: string;
};

export function MyBreadCrumb({ data }: { data: BreadCrumbItemData[] }) {
  const prevLinks = data.filter((d) => d.href);
  const currentLink = data.find((d) => !d.href);
  const prevLinkComponents = prevLinks.map((pl, index) => (
    <BreadcrumbItem key={Number(`${index}00`)}>
      <BreadcrumbLink href={pl.href}>{pl.name}</BreadcrumbLink>
    </BreadcrumbItem>
  ));
  const alteredNumbers = prevLinkComponents.flatMap((num, index) =>
    index < prevLinkComponents.length - 1
      ? [num, <BreadcrumbSeparator key={Number(`${index}11`)} />]
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
