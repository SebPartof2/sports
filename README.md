# MLB Scores Website

A modern, responsive MLB scores and schedule website built with Next.js and deployable to Cloudflare Pages.

## Features

- 📅 Today's MLB schedule
- ⚾ Live game scores and updates
- 🏆 Final game results
- 🔄 Auto-refresh every 30 seconds
- 📱 Responsive design
- ⚡ Fast loading with Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sports
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

The app uses the free MLB Stats API by default. You can also configure other APIs:

### Option 1: MLB Stats API (Default - Free)
No configuration needed. The app uses `https://statsapi.mlb.com/api/v1/schedule`

### Option 2: ESPN API
Uncomment the ESPN API call in `lib/api.ts`

### Option 3: Premium API with API Key
1. Create a `.env.local` file:
```bash
NEXT_PUBLIC_MLB_API_KEY=your_api_key_here
```

2. Update the API calls in `lib/api.ts` to use your preferred service.

## Deployment

### Deploy to Cloudflare Pages

1. Build for Cloudflare Pages:
```bash
npm run pages:build
```

2. Deploy using Wrangler CLI:
```bash
npm run pages:deploy
```

### Alternative: Connect GitHub Repository
1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect your GitHub repository
3. Set build command: `npm run pages:build`
4. Set build output directory: `.vercel/output/static`

## Project Structure

```
sports/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page component
├── lib/
│   └── api.ts          # API utility functions
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run pages:deploy` - Deploy to Cloudflare Pages
- `npm run lint` - Run ESLint

## Customization

### Adding Team Logos
1. Add team logo images to `public/logos/`
2. Update the `GameCard` component to display logos

### Styling
- Edit `app/globals.css` for global styles
- Modify `tailwind.config.js` for custom colors and themes
- Update components for layout changes

### API Integration
- Edit `lib/api.ts` to change data sources
- Add environment variables for API keys
- Implement error handling and retry logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.