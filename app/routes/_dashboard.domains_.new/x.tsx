import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MyBreadCrumb } from "../_dashboard.campaigns_.$id_.stats/components/bc";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { Cart } from "./components/cart";
import { useAtom } from "jotai";
import { FaRegTrashCan } from "react-icons/fa6";
import { TiTick } from "react-icons/ti";



export function Page() {
    const fetcher = useFetcher();
    const [cart, setCart] = useAtom(cartAtom);
    const [added, setAdded] = useState(false);
    const [latestId, setLatestId] = useState(0);
    let domains = [
        {
            id: "1",
            name: "example.com",
            priceInUSD: 10,
            isAvailable: true,
        },
    ];

    return (
        <>
            <div className="flex h-screen max-h-screen flex-col  pt-6">
                <div className="flex justify-between px-6 *:my-auto">
                    <div className="flex flex-col">
                        <MyBreadCrumb
                            data={[
                                {
                                    name: "Domains",
                                    href: "/domains",
                                },
                                {
                                    name: "Purchase New",
                                },
                            ]} />
                        <div className="pt-2"></div>
                        <h1 className="text-xl font-bold">
                            Find your perfect domain and buy it.
                        </h1>
                        <p className="text-gray-500"></p>
                    </div>
                    <Cart cartState={cart} updateCartState={setCart} />
                </div>
                <div className="pt-2"></div>

                <div className="flex flex-grow flex-col  bg-primary-foreground px-6">
                    <div className={domains.length === 0 ? "h-1/3" : "pt-8"}></div>
                    <div
                        className={` mx-auto flex w-full max-w-[42rem] flex-col gap-2 ${domains.length === 0 ? "" : ""} `}
                    >
                        <h1 className="mx-auto text-4xl font-bold">
                            Find your perfect domain.
                        </h1>
                        <Form method="post">
                            <div className="flex gap-2">
                                <Input name="search" placeholder="Search..." />
                                <Button type="submit">Search</Button>
                            </div>
                        </Form>

                        {domains.map((domain, index) => (
                            <div
                                key={index}
                                className="flex justify-between gap-1 rounded border bg-secondary px-4 py-5 align-top *:my-auto h-20 "
                            >
                                <div className="flex gap-2 *:my-auto">
                                    {added && (
                                        <FaRegTrashCan
                                            onClick={() => {
                                                setAdded(false);
                                                setCart(cart.filter((item) => item.id !== domain.id));
                                            }}
                                            className="cursor-pointer text-red-400" />
                                    )}
                                    <p className="text-md">{domain.name}</p>
                                </div>
                                <div className="flex  gap-2 *:my-auto">
                                    <p className="text-md text-gray-600 dark:text-gray-400">
                                        ${domain.priceInUSD}/yr
                                    </p>
                                    {added && (
                                        <div className="flex *:my-auto">
                                            <TiTick className="text-green-500" />
                                            <p>In Cart</p>
                                        </div>
                                    )}
                                    {!added && (
                                        <Button
                                            onClick={added
                                                ? undefined
                                                : () => {
                                                    setLatestId(latestId + 1);
                                                    setAdded(true);
                                                    setCart([
                                                        ...cart,
                                                        {
                                                            price: 10,
                                                            name: "example.com",
                                                            id: String(latestId),
                                                            isAvailable: true,
                                                        },
                                                    ]);
                                                }}
                                            variant={"secondary"}
                                            className="flex gap-1 border dark:border-gray-600"
                                        >
                                            <MdOutlineAddShoppingCart />
                                            <>Add to cart</>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

