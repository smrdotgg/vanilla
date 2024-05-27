import {
  FaShield,
  FaShieldHalved,
  FaInfo,
  FaExclamation,
} from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { TextItem } from "./components/text_item";
import { MyBreadCrumb } from "./components/bc";
import { Await, useLoaderData } from "@remix-run/react";
import { loader } from "./route";
import { Suspense } from "react";

export function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense fallback={<p>loading...</p>}>
        <Await resolve={data.campaign}>
          {(camp) => (
            <MyBreadCrumb
              data={[
                {
                  name: "Campaigns",
                  href: "/campaigns",
                },
                { name: camp.name },
              ]}
            />
          )}
        </Await>
      </Suspense>
      <div className="flex gap-2">
        <Suspense fallback={<p>loading...</p>}>
          <Await resolve={data.deliverability}>
            {(deliverability) => (
              <TextItem
                icon={<RiVerifiedBadgeFill />}
                onClick={() => {}}
                subText={"No issues detected"}
                bottomLeftComponent={<p>bonkers</p>}
                mainText={`${deliverability * 100}%`}
                label={"Deliverabilty Rate"}
              />
            )}
          </Await>
        </Suspense>
        {
          <Suspense fallback={<p>loading...</p>}>
            <Await resolve={data.analyticSettings}>
              {(settings) =>
                settings.openRate ? (
                  <Suspense fallback={<p>loading...</p>}>
                    <Await resolve={data.openRate}>
                      {(openRate) => (
                        <TextItem
                          icon={<FaRegEye />}
                          bottomLeftComponent={<p>bonkers</p>}
                          mainText={`${openRate * 100}%`}
                          label={"Open Rate"}
                        />
                      )}
                    </Await>
                  </Suspense>
                ) : (
                  <></>
                )
              }
            </Await>
          </Suspense>
        }
        <Suspense fallback={<p>loading...</p>}>
          <Await resolve={data.ctr}>
            {(ctr) => (
              <TextItem
                icon={<FaRegEye />}
                bottomLeftComponent={<p>bonkers</p>}
                mainText={`${ctr * 100}%`}
                label={"Click Through Rate"}
              />
            )}
          </Await>
        </Suspense>
        <Suspense fallback={<p>loading...</p>}>
          <Await resolve={data.optOut}>
            {(ctr) => (
              <TextItem
                icon={<FaRegEye />}
                bottomLeftComponent={<p>bonkers</p>}
                mainText={`${ctr * 100}%`}
                label={"Optout rate"}
              />
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
