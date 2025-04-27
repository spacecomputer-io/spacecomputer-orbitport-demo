# Cosmic Wayfinder - SpaceComputer Orbitport Integration Demo

A cosmic-themed lottery application that demonstrates the use of Orbitport's cTRNG (cosmic True Random Number Generator) API. Users can "launch" to discover random planets, with each planet's selection powered by true cosmic randomness from satellites in orbit.

![Demo Screenshot](./public/demo.png)

## 🌌 Features

- Interactive cosmic interface with animated planet discovery
- True random number generation powered by Orbitport's cTRNG
- Planet rarity system (Common, Rare, Legendary)
- Responsive design for both desktop and mobile
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn/pnpm
- Orbitport API credentials (client ID and secret)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/spacecomputerio/spacecomputer-orbitport-demo.git
cd spacecomputer-orbitport-demo
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Orbitport credentials:

```env
ORBITPORT_API_URL=https://dev-1usujmbby8627ni8.us.auth0.com
ORBITPORT_AUTH_URL=https://op.spacecomputer.io
ORBITPORT_CLIENT_ID=your-client-id
ORBITPORT_CLIENT_SECRET=your-client-secret
AUTH_SECRET= # 32 bytes long secret
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## 🔧 Technical Implementation

### Cosmic Randomness Integration

The application uses Orbitport's cTRNG API to generate true random numbers from space-based sources:

1. **Randomness Source**:

   - Primary: `cosmic/aptos_orbital` - Space-based randomness from cEDGE/Crypto2 satellites
   - Fallback: `local/cosmic_seed` - Derived from cosmic random seed
   - Last resort: `local/go_crypto` - Local randomness (used in testing)

2. **Implementation Flow**:
   - User clicks the launch button
   - Backend requests a random seed from Orbitport's API
   - The seed is used to generate a planet ID (0-99)
   - Planet details are randomized based on the cosmic randomness seed
   - Results are displayed with animations

### API Integration

The application uses a Next.js API route to securely communicate with Orbitport's API:

```typescript
// Example API route implementation
export async function GET() {
  // First, get the OAuth token from the Orbitport auth URL
  const authResponse = await fetch(`${ORBITPORT_AUTH_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: ORBITPORT_CLIENT_ID,
      client_secret: ORBITPORT_CLIENT_SECRET,
      audience: `${ORBITPORT_API_URL}/api`,
      grant_type: "client_credentials",
    }),
  });

  const data = await authResponse.json();
  const token = data.access_token;

  const response = await fetch(`${ORBITPORT_API_URL}/api/v1/services/trng`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}
```

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Orbitport API](https://op.spacecomputer.io/api) - Cosmic randomness provider

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- SpaceComputer team for providing the Orbitport API
- All contributors to the open-source libraries used in this project
