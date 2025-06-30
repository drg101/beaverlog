# Dinolytics
Super simple, self-hostable product analytics deployed 100% within Deno deploy.

### Why?
Not sharing user usage data with third parties makes compliance simpler, and keeps a privacy policy very short. Although self-hosting product analytic options like [PostHog CE](https://posthog.com/docs/self-host) **do exist**, they are heavy and require time and effort to be put into the devops for maintaning them.

Dinolytics solves this by deploying 100% within Deno deploy - meaning:
- No containers to set up
- No docker deploy
- Not even a postgres database to set up
- One command, and you're done

### How?
Dinolytics deploys directly to [Deno Deploy](https://docs.deno.com/deploy/early-access/), and uses [KV on Deno Deploy](https://docs.deno.com/deploy/kv/manual/on_deploy/) as its underlying data-store.