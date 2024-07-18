import { Permit } from "permitio";
import { env } from "~/env";

const permit = new Permit({
  // your API Key
  token: env.PERMIT_API_KEY,
  // in production, you might need to change this url to fit your deployment
  pdp: "http://localhost:7766",
  // if you want the SDK to emit logs, uncomment this:
  // log: {
  //   level: "debug",
  // },
  // The SDK returns false if you get a timeout / network error
  // if you want it to throw an error instead, and let you handle this, uncomment this:
  // throwOnError: true,
});

export async function GET() {
  try {
    let returnStr;
    const permitted = await permit.check("unique_id_12345", "create", "Document");

    if (permitted) {
      returnStr = "Sam is PERMITTED to create a document"
    } else {
      returnStr = "Sam is NOT PERMITTED to create a document"
    }

    return new Response(JSON.stringify({ message: returnStr }))
  } catch (error) {
    console.log('GET.error', { details: error });
    return new Response(JSON.stringify(error))
  }
}