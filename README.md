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
- Viewing curated videos for worship, sermons, and Bible study
- Connecting with the faith community through wallet integration

This project exists solely to glorify Christ and spread His message without monetization or speculation.

## ✨ Features

### 🕊️ Faith & Testimony
- Daily verse display with automatic fetching
- One-click sharing to Farcaster with recast functionality
- Christ-centered content sharing

### 📖 Bible Reader
- Online Bible reading with verse navigation
- PDF and TXT download options for offline access
- Verse parsing and sharing capabilities

### 🎥 Video Library
- Curated YouTube embeds for sermons, worship, and Bible studies
- Admin-gated video addition for quality control
- Category-based organization (Sermon, Worship, Testimony, Bible Study)

### 🔐 Wallet Integration
- Farcaster AuthKit integration for seamless authentication
- Profile display with username and avatar
- Secure wallet connection for sharing features

### 🎨 User Experience
- Dark/Light theme toggle with persistence
- Mobile-responsive design
- Professional UI with Tailwind CSS
- Splash screen for first-time visitors

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom themes
- **Authentication**: [Farcaster AuthKit](https://docs.farcaster.xyz/auth-kit/introduction) + wagmi + viem
- **State Management**: React Query for data fetching
- **Deployment**: [Vercel](https://vercel.com/)
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

   Copy `.env.local.example` to `.env.local` and configure:
   ```env
   NEXT_PUBLIC_APP_URL=https://yeshua-christ.vercel.app
   NEXT_PUBLIC_DOMAIN=yeshua-christ.vercel.app
   NEXT_PUBLIC_SIWE_URI=https://yeshua-christ.vercel.app
   NEXT_BIBLES_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📱 Usage

### For Users

1. **Home Page**: View the daily verse and navigate to different sections
2. **Faith Section**: Share testimonies and Christ-centered content
3. **Bible Section**: Read the Bible online or download for offline use
4. **Videos Section**: Watch curated sermons and worship content
5. **Wallet Connection**: Connect your Farcaster wallet to enable sharing features

### For Admins

Access admin features by clicking the logo 10 times on the home page:
- Manage admin rules
- Add new videos to the library

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_DOMAIN`
   - `NEXT_PUBLIC_SIWE_URI`
   - `NEXT_BIBLES_API_KEY`
3. **Deploy** - Vercel will handle the build and deployment automatically

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

- Thanks to the Farcaster community for the authentication tools
- Bible API provided by [Daily Bible](https://dailybible.ca/)
- Icons and assets designed with faith and reverence

## 📞 Contact

For questions or collaboration opportunities, please open an issue on GitHub.

---

<div align="center">
  <p><strong>Built with ❤️ for Christ and His Kingdom</strong></p>
  <p>"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost." - Matthew 28:19</p>
</div>
