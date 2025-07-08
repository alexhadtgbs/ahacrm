# ClínicaCRM - Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/it/login
- **Cases List**: http://localhost:3000/it/cases

## 📊 What's Included

### ✅ Completed Features
- **Modern UI/UX**: Clean, professional design with Tailwind CSS
- **Case Management**: Full CRUD operations with filtering and search
- **Responsive Design**: Works on desktop, tablet, and mobile
- **API Endpoints**: Ready for Supabase integration
- **Database Schema**: Complete SQL setup for Supabase
- **TypeScript**: Full type safety throughout the application
- **Component Library**: Reusable UI components
- **Mock Data**: Sample cases for testing and development

### 🎯 Key Pages
1. **Login Page** (`/it/login`) - Authentication interface
2. **Cases List** (`/it/cases`) - Main dashboard with filtering
3. **Case Detail** (`/it/cases/[id]`) - Individual case management
4. **API Routes** - Dialer integration and CSV export

### 🔧 API Endpoints
- `GET /api/dialer` - Test dialer integration
- `GET /api/export` - Test CSV export
- `POST /api/dialer` - Production dialer endpoint
- `POST /api/export` - Production export endpoint

## 🗄 Database Setup

### Option 1: Use Mock Data (Current)
The application currently uses mock data, so you can start using it immediately without database setup.

### Option 2: Set Up Supabase
1. Create a Supabase project
2. Run the SQL from `database/schema.sql` in your Supabase SQL editor
3. Update your `.env.local` with Supabase credentials
4. Replace mock data with real Supabase queries

## 🎨 Design System

### Colors
- **Primary**: #008080 (Teal)
- **Secondary**: #D4EDDA (Light Green)
- **Background**: #F8F9FA (Light Gray)
- **Surface**: #FFFFFF (White)

### Typography
- **Font Family**: Inter, Nunito Sans
- **Responsive**: Optimized for all screen sizes

## 📱 Features Ready to Use

### Case Management
- ✅ View all cases in a sortable table
- ✅ Filter by status, channel, date, and search terms
- ✅ Click to view detailed case information
- ✅ Add notes and observations
- ✅ Update case status and outcomes
- ✅ Export filtered data to CSV

### User Interface
- ✅ Professional, medical-focused design
- ✅ Responsive layout for all devices
- ✅ Accessible components with proper ARIA labels
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback

### Data Structure
- ✅ Patient information (name, contact, clinic)
- ✅ Lead source tracking (web, Facebook, influencer)
- ✅ Status management (in progress, appointment, closed)
- ✅ Follow-up scheduling
- ✅ Campaign tagging for dialer integration

## 🔄 Next Steps

### For Development
1. **Connect to Supabase**: Replace mock data with real database queries
2. **Add Authentication**: Implement real user login/logout
3. **Add More Features**: User management, reporting, etc.
4. **Test CCaaS Integration**: Connect with your dialer system

### For Production
1. **Deploy to Vercel/Netlify**: Follow deployment instructions in README
2. **Set up Production Database**: Configure Supabase for production
3. **Configure Environment Variables**: Set production URLs and keys
4. **Set up Monitoring**: Add error tracking and analytics

## 🐛 Troubleshooting

### Common Issues
1. **Port 3000 in use**: Change port in `package.json` scripts
2. **TypeScript errors**: Run `npm install` to ensure all dependencies are installed
3. **Styling issues**: Ensure Tailwind CSS is properly configured

### Getting Help
- Check the main `README.md` for detailed documentation
- Review the `database/schema.sql` for database setup
- Examine the component structure in `components/` directory

## 🎉 You're Ready!

The ClínicaCRM application is now ready for development and testing. The mock data allows you to explore all features immediately, and the Supabase integration is ready when you want to connect to a real database.

Happy coding! 🚀 