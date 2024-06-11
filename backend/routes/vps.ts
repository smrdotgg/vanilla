import { Hono } from "hono"

export const vpsRoute = new Hono()

vpsRoute.post('/', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  })
})

// fetch("https://my.contabo.com/rdns/update", {
//   "headers": {
//     "accept": "application/json, text/javascript, */*; q=0.01",
//     "accept-language": "en-US,en;q=0.7",
//     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Brave\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "sec-gpc": "1",
//     "x-requested-with": "XMLHttpRequest",
//     "cookie": "__stripe_mid=b86bb0a9-e975-442c-841e-e0d4d8ad2f8271dda5; cf_clearance=MoQku7_VXLANMQoJBnjmW0c49S0938DWN_cKsQCU2Ps-1718047968-1.0.1.1-z75prAmidGJoTalEnsvH1YmvxWNeG98vIjyDCheSdTuAy8E2kUjAA9WzocEscuUwdvs05aI67TljF44h8T4D6Q; GH=ajcip34uuta10lqtffvgpiej1f",
//     "Referer": "https://my.contabo.com/rdns",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "_method=POST&data%5B_Token%5D%5Bkey%5D=e97d5a04213bc2230f700dafe30ba61e75cdfebfedaaf556cb2a50d9d85adbee78a490d2e4b77b1da0e3267b0ece141ed708ae592f41777a491f1ed565d8d0da&data%5Bid%5D=14&data%5Bip%5D=2a02%3Ac206%3A2188%3A3345%3A0000%3A0000%3A0000%3A0001&data%5Bptr%5D=exampletwo.com&data%5B_Token%5D%5Bfields%5D=9e18eabed60bc60e6348a32c8eb366a0c46abb5b%253A&data%5B_Token%5D%5Bunlocked%5D=id",
//   "method": "POST"
// });
