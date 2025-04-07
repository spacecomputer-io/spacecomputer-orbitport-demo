# Cosmic Wayfinder - Spacecoin Orbitport Integration Demo

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
git clone https://github.com/easonchai/spacecoin-orbitport.git
cd spacecoin-orbitport
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Orbitport credentials:

```env
OP_AUTH_URL=dev-1usujmbby8627ni8.us.auth0.com
OP_CLIENT_ID=your-client-id
OP_CLIENT_SECRET=your-client-secret
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
  const token = await getOrbitportToken();
  const response = await fetch("https://op.spacecoin.xyz/api/v1/rand_seed", {
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
- [Orbitport API](https://op.spacecoin.xyz/api) - Cosmic randomness provider

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spacecoin team for providing the Orbitport API
- All contributors to the open-source libraries used in this project
