# ClínicaCRM - Lead Management Platform

A modern, web-based lead management platform designed specifically for ophthalmology clinics and medical centers. ClínicaCRM centralizes all patient inquiries from various channels into a single, intuitive interface, streamlining the follow-up process and improving patient acquisition.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/logout with role-based access
- **Case Management**: Complete CRUD operations for patient cases/leads
- **Advanced Filtering**: Filter cases by date, status, channel, assigned agent, and name
- **Real-time Search**: Instant search across patient names, emails, and phone numbers
- **Observation Logging**: Time-stamped notes to track interaction history
- **Status Tracking**: Monitor case progress from initial contact to appointment

### CCaaS Integration
- **Phone Lookup API**: Dedicated endpoint for screen pop functionality (`/api/lookup`)
- **Dialer Integration**: Secure API endpoint for outbound dialer systems
- **Screen Pop Functionality**: Automatic case record opening via URL
- **Campaign Management**: Tag-based lead organization for dialer campaigns
- **Multi-Platform Support**: Ready for Genesys Cloud, Amazon Connect, Twilio Flex, Five9, and more

### Data Management
- **CSV Export**: Export filtered case lists for external analysis
- **Multi-language Support**: Italian and Spanish localization
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### User Roles
- **Call Center Agents**: View assigned cases, make calls, add notes, schedule appointments
- **Commercial Managers**: Monitor team performance, analyze marketing channels
- **Administrators**: User management and high-level metrics overview

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, REST API) with SSR support
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with validation
- **State Management**: SWR for server state, React Context for global state
- **Internationalization**: next-intl
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd clinicacrm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your Supabase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase project details:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the project settings
3. Update your `.env.local` file with these values

#### Create Supabase Tables
Run the following SQL in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_to UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  channel TEXT CHECK (channel IN ('WEB', 'FACEBOOK', 'INFLUENCER')) NOT NULL,
  origin TEXT NOT NULL,
  status TEXT CHECK (status IN ('IN_CORSO', 'CHIUSO', 'APPUNTAMENTO')) DEFAULT 'IN_CORSO',
  outcome TEXT,
  clinic TEXT NOT NULL,
  treatment TEXT,
  promotion TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  dialer_campaign_tag TEXT
);

-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL
);

-- Create RPC function for dialer integration
CREATE OR REPLACE FUNCTION get_leads_for_dialer(campaign_tag_filter TEXT)
RETURNS TABLE(record_id BIGINT, phone_e164 TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.phone
  FROM cases c
  WHERE c.dialer_campaign_tag = campaign_tag_filter
    AND c.status != 'CHIUSO'
    AND c.follow_up_date IS NOT NULL
    AND c.follow_up_date <= NOW()
  ORDER BY c.follow_up_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all cases" ON cases
  FOR SELECT USING (true);

CREATE POLICY "Users can insert cases" ON cases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update cases" ON cases
  FOR UPDATE USING (true);

CREATE POLICY "Users can view notes for cases they have access to" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_channel ON cases(channel);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_dialer_campaign_tag ON cases(dialer_campaign_tag);
CREATE INDEX idx_notes_case_id ON notes(case_id);
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Usage

### Authentication
1. Navigate to `/it/login` or `/es/login`
2. Enter your credentials
3. You'll be redirected to the cases dashboard

### Managing Cases
1. **View Cases**: The main dashboard shows all cases with filtering options
2. **Filter Cases**: Use the filter panel to search by name, status, channel, or date
3. **View Details**: Click on any case row to open the detailed view
4. **Add Notes**: Use the notes section to log interactions and observations
5. **Update Status**: Change case status and add outcomes
6. **Export Data**: Use the export button to download filtered cases as CSV

### CCaaS Integration
- **Phone Lookup API**: `GET /api/lookup?phone=+391234567890` or `POST /api/lookup` with phone in body
- **Dialer API**: `POST /api/dialer` with `{ "campaign_tag_filter": "Q1-Follow-Up" }`
- **Screen Pop**: Navigate to `/it/cases/{caseId}` to open specific case records
- **Lead Fetching**: The dialer can fetch leads via the API endpoint
- **API Documentation**: Visit `/api/docs` for interactive Swagger documentation

## 🌐 Internationalization

The application supports Italian (it) and Spanish (es) locales:

- Italian: `/it/cases`
- Spanish: `/es/cases`

Language switching is handled through the URL structure and can be extended with a language switcher component.

## 🔧 API Endpoints

### Cases Management
- `GET /api/cases` - List cases with optional filtering
- `POST /api/cases` - Create new case
- `PUT /api/cases` - Update case (full update)
- `PATCH /api/cases` - Update case (partial update)
- `DELETE /api/cases/delete` - Delete case by ID

### Documentation
- `GET /api/docs` - OpenAPI specification
- `GET /api-docs` - Interactive Swagger UI

### API Key Management
- **Web Interface**: Navigate to `/api-keys` to manage your API keys
- **Multiple Key Types**: Secure (Base64), readable (hex), and prefixed keys
- **Permission Control**: Granular permissions (read, write, admin)
- **Usage Tracking**: Monitor key usage and last access
- **Expiration Support**: Optional key expiration dates

For detailed documentation, see [API Key Management Guide](docs/API_KEY_MANAGEMENT.md).

### Authentication
The API supports both session-based authentication (for web browsers) and API key authentication (for programmatic access).

**API Key Setup:**
```env
API_KEY=your-secret-api-key-here
```

**Usage Examples:**
```bash
# Get all cases
curl -X GET "http://localhost:3000/api/cases" \
  -H "x-api-key: your-secret-key"

# Create new case
curl -X POST "http://localhost:3000/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{"first_name":"John","last_name":"Doe","phone":"+1234567890","channel":"WEB","origin":"Test","clinic":"Test Clinic"}'
```

### Testing Status
- ✅ **GET /api/cases**: Fully working with filtering
- ✅ **POST /api/cases**: Fully working
- ✅ **PATCH /api/cases**: Fully working
- ✅ **PUT /api/cases**: Fully working
- ⚠️ **DELETE /api/cases/delete**: Needs fixing (returns HTML)
- ⚠️ **Authentication**: Partially working (needs environment setup)

For detailed testing results, see [API Testing Guide](docs/API_TESTING_GUIDE.md).

## 🎨 Design System

### Colors
- **Primary**: #008080 (Teal)
- **Secondary**: #D4EDDA (Light Green)
- **Background**: #F8F9FA (Light Gray)
- **Surface**: #FFFFFF (White)
- **Text Primary**: #212529 (Dark Gray)
- **Text Secondary**: #6C757D (Medium Gray)

### Typography
- **Font Family**: Inter, Nunito Sans
- **H1**: 28px, Bold
- **H2**: 22px, Bold
- **Body**: 16px, Regular
- **Label**: 14px, Medium

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- Input validation and sanitization
- CORS protection on API routes
- Environment variable protection

## 📊 Performance

- Static generation for better SEO
- Image optimization with Next.js
- Efficient data fetching with SWR
- Lazy loading for better initial load times
- Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Changelog

### v0.1.0 (Current)
- Initial release
- Basic CRUD operations for cases
- Authentication system
- CCaaS integration endpoints
- CSV export functionality
- Italian and Spanish localization
- Responsive design
- Advanced filtering and search 