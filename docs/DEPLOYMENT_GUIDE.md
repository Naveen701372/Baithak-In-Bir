# Deployment Guide

## 🚀 Production Deployment Guide

This guide covers deploying the restaurant management platform to production environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Setup](#post-deployment-setup)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
- **GitHub Account**: For code repository
- **Supabase Account**: For database and backend services
- **Vercel Account**: For hosting and deployment
- **Domain Provider**: For custom domain (optional)

### Required Tools
- **Node.js 18+**: Latest LTS version
- **Git**: Version control
- **npm or yarn**: Package manager

### Technical Requirements
- **SSL Certificate**: HTTPS encryption (handled by Vercel)
- **CDN**: Content delivery network (included with Vercel)
- **Database**: PostgreSQL (Supabase)

## Environment Setup

### 1. **Production Supabase Project**

#### Create Production Project
1. Log into [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and region
4. Set project name: `restaurant-management-prod`
5. Set strong database password
6. Wait for project initialization

#### Configure Production Database
1. Navigate to SQL Editor in Supabase
2. Run database setup scripts in order:
   ```sql
   -- 1. Run base schema
   -- Copy and paste contents of database/schema.sql
   
   -- 2. Run enhancements
   -- Copy and paste contents of database/run-enhancements.sql
   
   -- 3. Seed initial data (optional)
   -- Copy and paste contents of database/seed-simple.sql
   ```

#### Set Up Authentication
1. Go to Authentication > Settings
2. Configure Site URL: `https://yourdomain.com`
3. Add redirect URLs:
   - `https://yourdomain.com/admin/dashboard`
   - `https://yourdomain.com/admin/login`
4. Enable email confirmations (optional)

#### Configure Row Level Security
1. Ensure RLS is enabled on all tables
2. Verify admin policies are in place
3. Test authentication with admin user

### 2. **Production Environment Variables**

Create production environment configuration:

```env
# Production .env.local (for Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Database Setup

### 1. **Schema Migration**

#### Run Migration Scripts
```sql
-- 1. Base Schema (database/schema.sql)
-- Creates all tables, indexes, and constraints

-- 2. Enhanced Features (database/run-enhancements.sql)
-- Adds order management enhancements

-- 3. Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_status_order 
ON order_items(item_status, order_id);
```

#### Verify Schema
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies;
```

### 2. **Initial Data Setup**

#### Create Admin User
```sql
-- Insert admin user (replace with actual admin details)
INSERT INTO user_profiles (id, email, role, permissions)
VALUES (
  'admin-user-uuid',
  'admin@yourrestaurant.com',
  'admin',
  ARRAY['order_management', 'kitchen_operations', 'payment_management']
);
```

#### Add Menu Items
```sql
-- Add sample menu items (customize for your restaurant)
INSERT INTO menu_items (name, description, price, category, image_url, is_available)
VALUES 
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken', 15.99, 'Main Course', '/images/butter-chicken.jpg', true),
  ('Masala Tea', 'Traditional spiced tea', 3.99, 'Beverages', '/images/masala-tea.jpg', true),
  ('Naan Bread', 'Fresh baked Indian bread', 4.99, 'Sides', '/images/naan.jpg', true);
```

### 3. **Database Optimization**

#### Performance Settings
```sql
-- Optimize for production workload
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Reload configuration
SELECT pg_reload_conf();
```

#### Connection Pooling
- Supabase handles connection pooling automatically
- Default pool size: 15 connections
- Increase if needed through Supabase dashboard

## Vercel Deployment

### 1. **Repository Setup**

#### Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### Verify Build
```bash
# Test production build locally
npm run build
npm start

# Check for build errors
npm run type-check
npm run lint
```

### 2. **Vercel Project Setup**

#### Connect Repository
1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub repository
4. Select your restaurant management repository
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `baithak-in-bir` (if in subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Environment Variables
Add production environment variables in Vercel:
1. Go to Project Settings > Environment Variables
2. Add each variable:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-production-anon-key
   NEXT_PUBLIC_APP_ENV = production
   NEXT_PUBLIC_SITE_URL = https://yourdomain.com
   ```

### 3. **Deployment Configuration**

#### Vercel Configuration File
Create `vercel.json` in project root:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods", 
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": true
    }
  ]
}
```

#### Build Optimization
Update `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig
```

### 4. **Deploy to Production**

#### Initial Deployment
1. Click "Deploy" in Vercel dashboard
2. Monitor build logs for errors
3. Wait for deployment completion
4. Test deployment URL

#### Verify Deployment
1. **Frontend**: Check all pages load correctly
2. **Database**: Verify database connection
3. **Authentication**: Test admin login
4. **Real-time**: Confirm real-time updates work
5. **Mobile**: Test mobile responsiveness

## Custom Domain Setup

### 1. **Domain Configuration**

#### Add Domain to Vercel
1. Go to Project Settings > Domains
2. Add your custom domain: `yourdomain.com`
3. Add www subdomain: `www.yourdomain.com`
4. Vercel provides DNS configuration

#### DNS Configuration
Configure DNS with your domain provider:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2. **SSL Certificate**
- Vercel automatically provisions SSL certificates
- HTTPS enforced by default
- Certificate auto-renewal handled

### 3. **Update Environment Variables**
Update site URL in environment variables:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Post-Deployment Setup

### 1. **Admin Account Setup**

#### Create Admin User in Supabase Auth
1. Go to Supabase Authentication > Users
2. Click "Add User"
3. Enter admin email and password
4. Confirm email if required

#### Link to User Profile
```sql
-- Link auth user to admin profile
UPDATE user_profiles 
SET id = 'auth-user-uuid-from-supabase'
WHERE email = 'admin@yourrestaurant.com';
```

### 2. **Menu Setup**

#### Add Restaurant Menu Items
1. Use SQL to insert menu items, or
2. Create admin interface for menu management
3. Upload menu item images to Supabase Storage
4. Update image URLs in menu_items table

### 3. **Testing Checklist**

#### Functional Testing
- [ ] Customer can browse menu
- [ ] Customer can place orders
- [ ] Admin can login
- [ ] Order management works
- [ ] Kitchen view functions
- [ ] Real-time updates work
- [ ] Payment status updates
- [ ] Order cancellation works

#### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Database queries optimized
- [ ] Images load quickly
- [ ] Mobile performance good
- [ ] Real-time updates responsive

#### Security Testing
- [ ] Admin authentication required
- [ ] RLS policies enforced
- [ ] Input validation working
- [ ] XSS protection active
- [ ] HTTPS enforced

## Monitoring and Maintenance

### 1. **Performance Monitoring**

#### Vercel Analytics
1. Enable Vercel Analytics in project settings
2. Monitor page performance
3. Track user interactions
4. Identify performance bottlenecks

#### Supabase Monitoring
1. Monitor database performance
2. Check query execution times
3. Monitor connection usage
4. Set up alerts for issues

### 2. **Error Monitoring**

#### Error Tracking Setup
```typescript
// Add error tracking service (e.g., Sentry)
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV
})
```

#### Log Monitoring
- Monitor Vercel function logs
- Check Supabase logs for errors
- Set up alerts for critical errors

### 3. **Regular Maintenance**

#### Weekly Tasks
- [ ] Check system performance
- [ ] Review error logs
- [ ] Monitor database size
- [ ] Verify backups working

#### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Analyze usage patterns
- [ ] Optimize database queries

## Backup and Recovery

### 1. **Database Backups**

#### Automated Backups
- Supabase provides automatic daily backups
- Backups retained for 7 days (free tier)
- Upgrade plan for longer retention

#### Manual Backups
```bash
# Create manual backup
pg_dump "postgresql://user:pass@host:port/db" > backup.sql

# Restore from backup
psql "postgresql://user:pass@host:port/db" < backup.sql
```

### 2. **Code Backups**
- Git repository serves as code backup
- Vercel maintains deployment history
- Tag releases for easy rollback

### 3. **Recovery Procedures**

#### Database Recovery
1. Identify issue and scope
2. Stop application if necessary
3. Restore from latest backup
4. Verify data integrity
5. Resume operations

#### Application Recovery
1. Identify deployment issue
2. Rollback to previous deployment
3. Fix issue in development
4. Redeploy when ready

## Troubleshooting

### Common Deployment Issues

#### 1. **Build Failures**
**Problem**: Deployment fails during build

**Solutions:**
- Check build logs in Vercel
- Verify all dependencies installed
- Fix TypeScript errors
- Check environment variables

#### 2. **Database Connection Issues**
**Problem**: Cannot connect to database

**Solutions:**
- Verify Supabase URL and key
- Check RLS policies
- Confirm network connectivity
- Review authentication setup

#### 3. **Real-time Not Working**
**Problem**: Real-time updates not functioning

**Solutions:**
- Check Supabase real-time settings
- Verify subscription setup
- Test WebSocket connectivity
- Review browser console errors

#### 4. **Authentication Problems**
**Problem**: Admin login not working

**Solutions:**
- Verify admin user exists
- Check user_profiles table
- Confirm RLS policies
- Test authentication flow

### Performance Issues

#### 1. **Slow Page Loads**
**Solutions:**
- Optimize images and assets
- Enable compression
- Use CDN for static files
- Minimize JavaScript bundles

#### 2. **Database Query Performance**
**Solutions:**
- Add appropriate indexes
- Optimize query structure
- Use query analysis tools
- Consider caching strategies

### Security Issues

#### 1. **Unauthorized Access**
**Solutions:**
- Review RLS policies
- Check authentication setup
- Verify admin permissions
- Audit user access logs

#### 2. **Data Exposure**
**Solutions:**
- Confirm RLS enabled
- Review API endpoints
- Check error messages
- Validate input sanitization

---

## 📞 Support and Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Community Support
- Next.js Discord
- Supabase Discord
- Stack Overflow

### Professional Support
- Vercel Pro Support
- Supabase Pro Support
- Custom development services

---

**This deployment guide ensures a successful production deployment of your restaurant management platform. Follow each step carefully and test thoroughly before going live.**