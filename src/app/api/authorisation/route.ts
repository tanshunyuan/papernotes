import { newEnforcer } from "casbin";
import { BasicAdapter } from 'casbin-basic-adapter'
import path from "path";
import { Client as NodePgClient } from "pg";
import { env } from "~/env";

export async function GET() {
  const MODEL_FILENAME = 'abac_model.conf';
  const POLICY_FILENAME = 'abac_policy.csv';
  try {
    const modelFilePath = path.join(`${process.cwd()}/src/server/domains/authorisation/utils`, MODEL_FILENAME);
    const policyFilePath = path.join(`${process.cwd()}/src/server/domains/authorisation/utils`, POLICY_FILENAME);

    const e = await newEnforcer(modelFilePath, policyFilePath);

    const sub = 'alice'; // the user that wants to access a resource.
    const obj = 'data1'; // the resource that is going to be accessed.
    const act = 'read'; // the operation that the user performs on the resource.

    const enforceResult = await e.enforce(sub, obj, act)
    console.log('enforceResult', { enforceResult })
    let returnStr;
    if (enforceResult === true) {
      // permit alice to read data1
      returnStr = 'alice can read data1';
    } else {
      // deny the request, show an error
      returnStr = 'alice cannot read data1';
    }



    return new Response(JSON.stringify({ message: returnStr }))
  } catch (error) {
    console.log('GET.error', { details: error })
    return new Response(JSON.stringify(error))
  }
}