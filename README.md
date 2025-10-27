# MiraiVPN

A modern, high-performance VPN service built with Next.js 16, featuring real-time server metrics, Stripe payments, and WireGuard integration.

## Features

- 🚀 **Next.js 16** with App Router and TypeScript
- 🎨 **Dark Theme** with Tailwind CSS
- 💳 **Stripe Integration** for payments
- 📊 **Real-time Metrics** from WireGuard servers
- 🗄️ **SQLite Database** with Prisma ORM
- 🔧 **Lightweight Agents** for server monitoring
- 📱 **Responsive Design** for all devices

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- WireGuard servers (optional, for full functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd miraivpn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_VIP=price_...

# Admin
ADMIN_KEY=your-admin-key-here

# Agent tokens (match configs/servers.private.json)
AGENT_JP_OSA_1_TOKEN=your-agent-token
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
miraivpn/
├── agents/                    # Lightweight monitoring agents
│   ├── vpn-metrics-agent.sh
│   └── vpn-metrics-agent.service
├── configs/                   # Server configurations
│   ├── servers.public.json
│   └── servers.private.json
├── prisma/                    # Database schema
│   └── schema.prisma
├── public/                    # Static assets
│   └── logos/
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── (marketing)/       # Marketing pages
│   │   ├── api/               # API routes
│   │   ├── pricing/           # Pricing page
│   │   ├── faq/               # FAQ page
│   │   └── servers/           # Servers page
│   ├── components/            # React components
│   │   ├── ui/                # UI components
│   │   ├── ServerCard.tsx
│   │   ├── Plans.tsx
│   │   └── StatsBar.tsx
│   └── lib/                   # Utility libraries
│       ├── config.ts
│       ├── cache.ts
│       ├── metrics.ts
│       ├── stripe.ts
│       ├── db.ts
│       └── plans.ts
├── .env.example               # Environment template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Configuration

### Server Configuration

Edit `configs/servers.public.json` to define your public server list:

```json
[
  {
    "id": "jp-osa-1",
    "label": "Tokyo, Japan",
    "country": "Japan",
    "region": "Asia",
    "capacity": 1000,
    "features": ["WireGuard", "IPv6", "Kill Switch"],
    "publicLoad": 45
  }
]
```

Edit `configs/servers.private.json` for agent configurations:

```json
[
  {
    "id": "jp-osa-1",
    "ip": "192.168.1.100",
    "metricsPort": 8080,
    "token": "your-agent-token",
    "capacity": 1000,
    "wgInterface": "wg0"
  }
]
```

### Agent Deployment

Deploy the metrics agent on each WireGuard server:

1. Copy `agents/vpn-metrics-agent.sh` to your server
2. Make it executable: `chmod +x vpn-metrics-agent.sh`
3. Copy `agents/vpn-metrics-agent.service` to `/etc/systemd/system/`
4. Enable and start: `sudo systemctl enable --now vpn-metrics-agent`

### Stripe Setup

1. Create products and prices in your Stripe dashboard
2. Update the price IDs in `.env.local`
3. Set up webhooks pointing to `/api/stripe/webhook`

## API Endpoints

- `GET /api/servers/list` - Get server list with metrics
- `POST /api/servers/refresh` - Force refresh metrics (admin)
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client

### Testing

Test API endpoints:

```bash
# Get servers
curl http://localhost:3000/api/servers/list

# Refresh metrics (admin)
curl -X POST http://localhost:3000/api/servers/refresh \
  -H "Authorization: Bearer your-admin-key"
```

## Deployment

### Environment Variables

For production, ensure these environment variables are set:

- `NODE_ENV=production`
- `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
- All Stripe variables
- Admin key
- Agent tokens

### Build and Deploy

```bash
npm run build
npm run start
```

Or deploy to Vercel, Netlify, or any Node.js hosting platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the maintainers.
