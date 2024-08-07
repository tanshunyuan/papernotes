# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org) - [NextAuth.js](https://next-auth.js.org) - [Prisma](https://prisma.io) - [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Goal
1. Perfrom basic RBAC on CRUD operations for a project, admin can CRUD a project but member can only CR their own project. Additionally, admin can access a page which sees all the users
2. Add resource limits to projects, and organisation seats.
3. Add in organisation and team functionality to further introduce RBAC and resource limits, it'd be interesting to see how admin can only see projects that they are part of and not involve themselves with other organisations
4. Identify Saas employees and mark them as internal employees, so they can only access the internal tools

## What problem do I want to solve?

### 07/08/2024
1. Ensure only employees can access the Tools page which allows them to create organisations, and add project & features to organisations
2. Only allow invited employees to see organisation they're a part of.
3. Normal platform users can only see their own projects
4. The platform will have different pricing plans: free and, enterprise
5. Free won't have roles
6. Enterprise will have organisational roles
