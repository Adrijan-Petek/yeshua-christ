
# Yeshua-Christ

<div align="center">
  <img src="public/icons/icon-150x150.png" alt="Yeshua-Christ Logo" width="150" height="150" />
  <h3>A Christ-centered mini app for sharing faith, the Gospel, and biblical content freely.</h3>
  <p><em>"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." - John 3:16</em></p>
</div>

<div align="center">
  <a href="https://yeshua-christ.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit-blue?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/Adrijan-Petek/yeshua-christ/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/Adrijan-Petek/yeshua-christ/ci.yml?branch=main&style=for-the-badge" alt="CI Status" />
  </a>
  <a href="https://github.com/Adrijan-Petek/yeshua-christ/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Adrijan-Petek/yeshua-christ?style=for-the-badge" alt="License" />
  </a>
</div>

## 📖 About

Yeshua-Christ is a professional, faith-focused web application designed to share the Gospel, biblical teachings, and Christ-centered content freely. Built with modern web technologies, it provides a clean, accessible platform for:

- Sharing daily verses and testimonies on Farcaster
- Accessing Bible readings and downloads
- Viewing curated worship/teaching videos (YouTube + Facebook embeds)
- Connecting with the faith community through wallet integration

This project exists solely to glorify Christ and spread His message without monetization or speculation.

## ✨ Features

### 🕊️ Faith & Testimony
- Daily verse display with automatic fetching
- One-click sharing to Farcaster with recast functionality
- Christ-centered content sharing
- Live Farcaster feed with #YeshuaChrist posts
- Community rules and guidelines

### ✝️ Teachings
- “Yeshua: The Name of Jesus and Its Meaning” teaching card on the home page
- Optional Farcaster recast/share button for the teaching content

### 📖 Bible Reader
- **Interactive Bible Reading**: Full KJV Bible with verse-by-verse navigation
- **Multiple Formats**: Read online via PDF viewer or interactive text mode
- **Free Downloads**: PDF, DOCX, and TXT formats available
- **Verse Sharing**: Select and share individual verses to Farcaster
- **Mobile-Optimized PDF**: Displays inline on phones (no auto-download)
- **Smart Navigation**: Jump to any book and chapter instantly

### 🎥 Video Library
- YouTube and Facebook video embeds
- Tabs: Worship Music, Teaching Videos
- Admin-only add and remove controls (from the Videos page and Admin Panel)
- One-click sharing to Farcaster

### 🔐 Wallet Integration & Identity
- **Farcaster Mini App SDK**: Full integration with Quick Auth
- **Wallet-Based Identity**: Username and profile picture fetched from connected wallet
- **Secure Authentication**: JWT verification on backend
- **Profile Display**: Shows real Farcaster username, display name, and avatar
- **Fallback Chain**: Quick Auth → SDK context → Warpcast API enrichment

### 🎨 User Experience
- **Mobile-First Design**: Optimized for phone screens
- **Responsive Layout**: Adapts seamlessly from mobile to desktop
- **Dark/Light Theme**: Toggle with localStorage persistence
- **Professional UI**: Clean, modern design with Tailwind CSS
- **Fast Loading**: Splash screen with smooth animations
- **Consistent Spacing**: Uniform button sizes and padding throughout
- **Accessible**: WCAG-compliant color contrasts and tap targets

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (dark mode supported)
- **Farcaster Integration**: 
  - [@farcaster/miniapp-sdk](https://github.com/farcaster/miniapp-sdk) v0.2.1 - Mini App SDK with Quick Auth
  - [@farcaster/auth-kit](https://docs.farcaster.xyz/auth-kit/introduction) v0.8.1 - QR sign-in fallback
  - [@farcaster/quick-auth](https://github.com/farcaster/quick-auth) - Server-side JWT verification
- **Wallet/Web3**: wagmi + viem
- **Database**: MongoDB
- **Deployment**: [Vercel](https://vercel.com/) (Node.js runtime for API routes)
- **CI/CD**: GitHub Actions
- **Linting**: ESLint with TypeScript rules

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adrijan-Petek/yeshua-christ.git
   cd yeshua-christ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` and configure:
   ```env
   NEXT_PUBLIC_APP_URL=https://yeshua-christ.vercel.app
   NEXT_PUBLIC_DOMAIN=yeshua-christ.vercel.app
   NEXT_PUBLIC_SIWE_URI=https://yeshua-christ.vercel.app

   MONGODB_URI=mongodb+srv://...
   # optional:
   # MONGODB_DB=yeshua_christ

   # optional: bootstrap first admin user (only if no admins exist yet)
   # ADMIN_BOOTSTRAP_EMAIL=admin@example.com
   # ADMIN_BOOTSTRAP_PASSWORD=strong-password
   #
   # optional: Farcaster FIDs that should be considered admin in-app
   # ADMIN_FIDS=123,456
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Usage

### For Users

1. **Home Page**: View the daily verse and navigate to different sections
2. **Faith Section**: Share testimonies, view community feed, and post Christ-centered content
3. **Bible Section**: 
   - Switch between PDF and interactive text reader
   - Download Bible in PDF, DOCX, or TXT format
   - Select verses and share to Farcaster
4. **Videos Section**: Watch curated sermons and worship content
5. **Wallet Connection**: 
   - Connect your Farcaster wallet to enable sharing features
   - Your username and profile picture are automatically displayed
   - Quick Auth provides secure, wallet-verified identity

### Mobile Experience

The app is fully optimized for mobile devices:
- **PDF Viewer**: Displays inline on phones (no forced downloads)
- **Touch-Friendly**: All buttons optimized for tap targets
- **Responsive Text**: Scales appropriately on small screens
- **Compact Layout**: Reduced spacing for better mobile UX
- **Fast Loading**: Optimized splash screen (80x80 icon)

### For Admins

Access admin features by clicking the logo 10 times on the home page:
- Community rules editor (stored in localStorage)
- Video link management (add/remove)
- Admin security: login/logout, change password, create admin users

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_DOMAIN`
   - `NEXT_PUBLIC_SIWE_URI`
3. **Deploy** - Vercel will handle the build and deployment automatically

**Note**: For Farcaster Mini App deployment, ensure your app is registered at [https://warpcast.com/~/developers/mini-apps](https://warpcast.com/~/developers/mini-apps)

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions that align with our mission to glorify Christ and spread the Gospel.

### Guidelines

1. **Code Quality**: Ensure all code passes linting and type checking
2. **Christ-Centered**: All content and features should align with biblical principles
3. **Accessibility**: Maintain WCAG compliance for all users
4. **Testing**: Test on multiple devices and browsers

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the Farcaster community for the authentication tools and Mini App SDK
- Warpcast API for user profiles and feed integration
- King James Bible (KJV) - Public Domain
- Icons and assets designed with faith and reverence

## 🔧 Recent Updates

### January 2025 - Mobile Optimization Release
- **Identity Resolution**: Implemented wallet-based identity with Quick Auth and JWT verification
- **Mobile-First Redesign**: Comprehensive mobile optimization across all pages
- **PDF Viewer Fix**: Bible PDF now displays inline on mobile devices (no auto-download)
- **Responsive Components**: All buttons, spacing, and text sizes optimized for phones
- **Splash Screen**: Reduced logo size (128→80px) for better mobile experience
- **Consistent Design**: Unified button padding, rounded corners, and spacing throughout
- **Performance**: Build optimized and verified for production deployment

### 2026 - Admin + Video Updates
- Added admin removal for saved video links
- Added Facebook video embed support
- Added Yeshua teaching card under Daily Verse

## 📞 Contact

For questions or collaboration opportunities, please open an issue on GitHub.

---

<div align="center">
  <p><strong>Built with ❤️ for Christ and His Kingdom</strong></p>
  <p>"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost." - Matthew 28:19</p>
</div>
