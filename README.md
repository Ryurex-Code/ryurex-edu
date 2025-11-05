# 🎓 Ryurex Edu Vocab Game

An adaptive English vocabulary learning game that gets smarter as you do. Built with modern web technologies to provide a gamified, engaging learning experience.

## ✨ Features

- **🔐 User Authentication** - Secure login/signup with Supabase
- **🎯 Adaptive Learning** - Adjusts to your speed and learning style
- **⏱ Smart Review** - Spaced repetition for maximum retention
- **🏆 Gamified XP** - Earn points and level up
- **📊 Progress Tracking** - Detailed analytics and insights

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: [Supabase](https://supabase.com/)

## 🏗️ Project Structure

```
├── app/
│   ├── auth/callback/      # Auth callback handler
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   ├── signup/             # Sign up page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── Navbar.tsx          # Navigation with auth state
│   ├── Hero.tsx            # Hero section
│   ├── FeatureCard.tsx     # Feature cards
│   └── Footer.tsx          # Footer component
├── lib/
│   └── supabase/           # Supabase client utilities
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── middleware.ts   # Auth middleware
├── middleware.ts           # Next.js middleware
└── public/                 # Static assets
```

## 🎨 Design System

### Colors
- **Background**: `#0f1115` (Dark base)
- **Primary Yellow**: `#fee801` (Main accent)
- **Secondary Purple**: `#7c5cff` (Secondary accent)
- **Text**: Light gray/white

### Typography
- **Sans Serif**: Inter
- **Display**: Poppins

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 13-ryurex-edu
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase (See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions):
   - Create a Supabase project at [https://app.supabase.com](https://app.supabase.com)
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key to `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Responsive Breakpoints

Designed mobile-first with breakpoints:
- Mobile: 375×667
- Tablet: 768px+
- Desktop: 1440×900+

## 🗺️ Roadmap

### Phase 1: Landing Page ✅
- [x] Next.js setup with TypeScript
- [x] Responsive dark-themed UI
- [x] Animated components
- [x] Feature highlights
- [x] Hero section with CTA

### Phase 2: Authentication ✅
- [x] Supabase integration
- [x] Login/Sign up functionality
- [x] User session management
- [x] Protected routes middleware
- [x] Dashboard page

### Phase 3: Game Interface (Coming Soon)
- [ ] Vocabulary game mechanics
- [ ] XP and leveling system
- [ ] Progress dashboard

### Phase 4: Backend Integration (Coming Soon)
- [ ] Database schema
- [ ] Spaced repetition algorithm
- [ ] Analytics tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Ryurex**

---

Built with 💜 for better learning

