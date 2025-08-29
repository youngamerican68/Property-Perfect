# PropertyPerfect 🏡✨

> **AI-Powered Real Estate Photo Enhancement with Revolutionary LightLab Technology**

Transform your property photos with professional AI enhancement and photorealistic relighting. Never shoot at the wrong time of day again.

## 🚀 What PropertyPerfect Does

PropertyPerfect solves the #1 problem real estate agents face: **poor quality property photos that hurt engagement and sales**. Our platform combines traditional photo enhancement with revolutionary **LightLab relighting technology** to transform amateur photos into professional, MLS-ready images in under 60 seconds.

### 🎯 Core Value Propositions

- **"Never shoot at the wrong time of day again"** - Transform any lighting condition
- **"MLS-Ready Photos in 60 Seconds"** - Professional results instantly
- **"Compete with $500 photographers for $19"** - Affordable professional quality
- **"From Amateur to Professional in One Click"** - Revolutionary simplicity

## ✨ Features

### 🛠 Enhancement Tools
- **Declutter**: Remove unwanted objects, personal items, and clutter
- **Virtual Staging**: Add modern furniture and decor to empty spaces
- **Enhance**: Improve colors, quality, and overall appeal
- **Repair**: Fix damages, stains, and imperfections

### 🌅 LightLab Relighting (Revolutionary Feature)
Transform lighting and time-of-day appearance while preserving geometry:

- **Golden Hour**: Warm, dramatic sunset/sunrise lighting
- **Soft Overcast**: Even, flattering natural daylight
- **Bright Daylight**: Crisp, clean professional lighting  
- **Cozy Evening**: Warm, inviting interior ambiance

### 🎨 Advanced Capabilities
- **Custom Prompts**: Describe exactly what you want changed
- **Batch Processing**: Handle multiple photos at once (Pro/Agency tiers)
- **High-Resolution Outputs**: Up to 4K quality
- **Geometry Preservation**: Maintains structural elements and décor
- **MLS-Safe Exports**: Professional quality for real estate listings

## 🎪 User Journey Examples

### Scenario 1: The Last-Minute Listing
**Agent Sarah** has a tenanted property with cluttered photos. She uploads a messy living room and types: *"remove the toys and family photos, replace old sofa with modern grey one, brighten lighting"*. In 60 seconds, she has a clean, professional photo ready for MLS.

### Scenario 2: The Empty Room Challenge  
**Agent Tom** has vacant new builds looking sterile. He uploads an empty master bedroom and types: *"add king-sized bed with white linens, nightstands, large rug, and plant in corner"*. The result makes buyers envision their future home.

### Scenario 3: The FSBO Competition
**David** is selling his own home with phone photos. He uploads a backyard photo with kids' toys and selects "Golden Hour" preset. For $19, his amateur photos now compete with professional listings.

## 💳 Pricing & Plans

### 🏠 Starter Pack - $19
- **25 photo enhancements**
- All enhancement tools + LightLab relighting
- High-resolution outputs (4K)
- 30-day credit validity
- Perfect for individual agents

### 🏢 Professional Pack - $49 ⭐ *Most Popular*
- **75 photo enhancements** (15% savings)
- All tools + full LightLab suite
- Batch processing (up to 10 images)
- Priority support & faster processing
- 60-day credit validity
- Usage analytics dashboard

### 🏘 Agency Pack - $149
- **300 photo enhancements** (35% savings)
- Full LightLab suite + time-of-day transformations
- Batch processing (up to 50 images)
- Dedicated account manager
- 90-day credit validity
- Team management & custom branding
- API access (coming soon)

## 🛠 Technical Architecture

### Frontend Stack
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components with Radix primitives
- **Responsive design** for mobile/desktop

### Backend & Infrastructure  
- **Next.js API Routes** for serverless functions
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Google Gemini 2.5 Flash** for AI image processing
- **Stripe** for payment processing and webhooks

### Security & Authentication
- **Supabase Auth** with email verification
- **Google OAuth** integration ready
- **Protected routes** with middleware
- **JWT token** authentication
- **Row Level Security** on all database tables

### Key Integrations
- **Google AI Studio** - Gemini API for image enhancement
- **Stripe Checkout** - Professional payment processing  
- **Supabase** - Authentication, database, real-time features
- **Vercel/Railway** ready for deployment

## 📁 Project Structure

```
property-perfect/
├── app/
│   ├── api/
│   │   ├── enhance/route.ts              # AI enhancement endpoint
│   │   ├── create-checkout-session/      # Stripe checkout creation
│   │   └── stripe-webhook/route.ts       # Payment webhook handler
│   ├── dashboard/
│   │   ├── ImageJobEditor.tsx           # Main enhancement interface
│   │   └── page.tsx                     # Dashboard layout
│   ├── login/page.tsx                   # Login with Supabase auth
│   ├── signup/page.tsx                  # Registration with verification
│   ├── pricing/page.tsx                 # Stripe-integrated pricing
│   └── layout.tsx                       # Root layout with providers
├── components/
│   ├── ui/                             # Shadcn UI components
│   ├── Navbar.tsx                      # Auth state management
│   └── UploadGuidelines.tsx            # File upload guidance
├── lib/
│   ├── supabase-client.ts              # Client-side Supabase config
│   └── supabase-server.ts              # Server-side Supabase config
├── middleware.ts                       # Route protection & security
└── .env.local.example                  # Environment variables template
```

## 🔧 Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/youngamerican68/Property-Perfect.git
cd property-perfect
npm install
```

### 2. Environment Setup
Create `.env.local` with:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Enhancement
GEMINI_API_KEY=your_gemini_api_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Database Setup
The application uses Supabase with the following tables:
- `users` - User profiles and credit balances
- `enhancement_jobs` - Processing history and status
- `purchases` - Payment records and transaction history

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Stripe Webhooks (Development)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login and forward webhooks
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## 🎯 Target Audience

### Primary Users
- **Real Estate Agents** - Individual agents needing quick photo fixes
- **Property Managers** - Managing multiple listings efficiently  
- **Airbnb Superhosts** - Creating appealing rental photos
- **FSBO Sellers** - Competing with professional listings

### Use Cases
- **Last-minute listings** with cluttered or poorly lit photos
- **Vacant properties** needing virtual staging
- **Wrong time-of-day** photos requiring lighting transformation
- **Amateur photos** needing professional polish
- **Batch processing** for agencies with multiple listings

## 🏆 Competitive Advantages

### vs. Traditional Solutions
- **Professional Photography** ($200-500) → PropertyPerfect ($19-149)
- **Physical Staging** (weeks + $1000s) → Virtual staging (60 seconds)
- **Lightroom/Photoshop** (requires expertise) → One-click presets

### vs. Generic AI Editors
- ✅ **Real estate specific** prompts and workflows
- ✅ **LightLab relighting** technology (unique differentiator)
- ✅ **Geometry preservation** - no warped rooms or furniture
- ✅ **MLS-safe outputs** - professional standards
- ✅ **Batch processing** for efficiency

## 📊 Business Model

### Revenue Streams
- **Credit-based usage** - Pay per enhancement (no subscriptions)
- **Tiered pricing** - Starter ($19) → Professional ($49) → Agency ($149)
- **High-volume discounts** - Up to 35% savings on Agency tier

### Unit Economics
- **Average selling price**: $49 (Professional tier)
- **Credits per dollar**: ~$0.65 per enhancement
- **Market size**: 2M+ real estate agents in US
- **Retention driver**: Credit-based model encourages bulk purchases

## 🚀 Getting Started

### For Real Estate Agents
1. **Sign up** with email or Google OAuth
2. **Get 3 free credits** to test the platform
3. **Upload a property photo** (drag & drop)
4. **Choose enhancement type**:
   - Quick presets for common needs
   - Custom prompts for specific requirements
   - LightLab relighting for lighting issues
5. **Download professional results** in under 60 seconds

### For Development
1. **Clone repository** and install dependencies
2. **Set up Supabase** project with authentication
3. **Configure API keys** for Gemini and Stripe
4. **Run development server** and test workflows
5. **Deploy to production** (Vercel/Railway/etc.)

## 🔮 Roadmap

### Immediate (Post-Launch)
- [ ] Google OAuth provider configuration
- [ ] Email template customization
- [ ] Advanced analytics dashboard
- [ ] Mobile app considerations

### Short-term (Q1)
- [ ] API access for agencies
- [ ] Custom branding options
- [ ] Advanced batch processing
- [ ] Integration with MLS platforms

### Long-term (Q2+)
- [ ] Video enhancement capabilities
- [ ] 3D virtual tour integration
- [ ] White-label solutions
- [ ] Enterprise team features

## 📞 Support & Contact

- **Documentation**: [GitHub Wiki](https://github.com/youngamerican68/Property-Perfect/wiki)
- **Issues**: [GitHub Issues](https://github.com/youngamerican68/Property-Perfect/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/youngamerican68/Property-Perfect/discussions)

---

**Built with ❤️ for the real estate community**  
*Making professional property photography accessible to everyone*

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Last Updated: August 29, 2025*  
*Version: 2.0.0 - LightLab Release*