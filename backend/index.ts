import { Hono } from 'hono'
import { env } from '~/api';


const app = new Hono()
app.get('/', (c) => c.text('hello world'))

const url = `${env.BACKEND_URI}:${env.BACKEND_PORT}`;


console.log("Server is running on " + url);
export default {
  fetch: app.fetch,
  port: env.BACKEND_PORT,
}
