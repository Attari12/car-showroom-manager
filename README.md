# Car Showroom Manager

A comprehensive car showroom management system built with Next.js, Supabase, and TypeScript.

## Features

- 🚗 **Car Inventory Management** - Add, edit, and track car details with images and documents
- 📊 **Car Condition Assessment** - Grade cars based on painted vs genuine parts
- 👥 **Dealer & Buyer Management** - Maintain contacts and relationships
- 💰 **Debt Tracking** - Track money owed to/by dealers and buyers
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔐 **Authentication System** - Secure login for admin and clients
- 📄 **File Management** - Upload and manage car images and documents
- 📈 **Dashboard Analytics** - Overview of inventory, sales, and profits

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (Database + Storage + Auth)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd car-showroom-manager
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your Supabase credentials to `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. **Set up the database**
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Run the scripts in this order:
  1. `scripts/complete-database-setup.sql`
  2. `scripts/create-storage-buckets.sql`

5. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

6. **Open your browser**
Navigate to `http://localhost:3000`

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Client**: username: `client001`, password: `temp123`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── dashboard/         # Client dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── scripts/              # Database setup scripts
└── public/               # Static assets
\`\`\`

## Key Features

### Car Management
- Add new cars with detailed information
- Upload multiple images and documents
- Track car condition with grading system
- Monitor purchase/sale prices and profits

### Condition Assessment
- Visual car part condition checker
- Automatic grading based on genuine vs painted parts
- Generate auction sheets

### File Management
- Secure file upload to Supabase Storage
- Support for images (JPG, PNG) and documents (PDF)
- Automatic file organization by car ID

### Dashboard Analytics
- Overview of total inventory
- Sales and profit tracking
- Recent activity monitoring

## Database Schema

The application uses the following main tables:
- `clients` - User accounts
- `cars` - Car inventory
- `car_images` - Car photos
- `car_documents` - Car paperwork
- `car_conditions` - Condition assessments
- `dealers` - Dealer contacts
- `buyers` - Buyer contacts
- `debts` - Financial tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
