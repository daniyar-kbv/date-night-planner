# Date Night Planner

An interactive, mobile-first date invitation that turns a small romantic gesture into a playful flow and a shareable date ticket.

Designed for mobile browsers and deployment on Cloudflare Workers.

![Date Night Planner preview](public/og.png)

## Current experience

- Opens with a sealed animated envelope.
- Asks for a date today with a playful, respectful response flow.
- Lets the recipient choose one main activity and an optional second activity.
- Collects activity-specific preferences for a walk or food.
- Offers only future time slots for the current day in Almaty time.
- Shows a confirmation screen and generates a compact date ticket.
- Shares the final answer through the device share sheet or clipboard.

## Tech stack

- React 19
- Next.js-compatible Vinext runtime
- TypeScript
- Tailwind CSS
- Vite
- Cloudflare Workers tooling

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The invitation can be personalized through URL parameters:

```text
http://localhost:3000/?name=Любимая&from=твой%20муж
```

## Validation

```bash
npm run lint
npm run build
```

## Roadmap

- Reusable invitations and saved plans
- Custom activity catalogs
- Response persistence and notifications
- Private invitation links
- Multiple languages and time zones

## License

No license has been granted yet. The source is public for viewing, but reuse and redistribution require the author's permission.
