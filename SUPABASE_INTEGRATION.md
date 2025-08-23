# 🗄️ Supabase Integration Guide for ShiftManager2

This guide will help you set up Supabase as your database backend for ShiftManager2, replacing the local storage with a professional PostgreSQL database.

## 🚀 **Quick Start**

### 1. **Set Up Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. **Run Database Schema**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `SUPABASE_SCHEMA.sql`
4. Click **Run** to create all tables

### 3. **Export Data from ShiftManager2**
1. Open your ShiftManager2 app
2. Navigate to the month you want to export
3. Click the **Supabase** button (database icon)
4. Two files will download:
   - `supabase-export-{month}-{year}.json` - Raw data
   - `supabase-sql-{month}-{year}.sql` - SQL insert statements

### 4. **Import Data to Supabase**
1. Go to Supabase SQL Editor
2. Copy the contents of your SQL file
3. Click **Run** to import all data

## 📊 **Database Schema**

### **Tables Created:**

#### **employees**
- `id` - Employee identifier
- `name` - Employee name
- `color` - UI color code
- `custom_hours` - JSONB field for custom hour overrides
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

#### **assignments**
- `id` - Unique assignment identifier
- `date` - Date in DD.MM format
- `shift` - 'early' or 'night'
- `employee_id` - References employees table
- `month` - Month number (0-11)
- `year` - Year
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

#### **holidays**
- `id` - Date in DD.MM format
- `date` - Date in DD.MM format
- `name` - Holiday name
- `month` - Month number
- `year` - Year
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

#### **vacations**
- `id` - Unique vacation identifier
- `employee_id` - References employees table
- `start_date` - Start date in DD.MM format
- `end_date` - End date in DD.MM format
- `description` - Vacation description
- `month` - Month number
- `year` - Year
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

#### **month_infos**
- `id` - Unique info identifier
- `month` - Month name
- `year` - Year
- `info` - Information text
- `type` - 'frontend' or 'backend'
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

#### **day_notes**
- `id` - Date in DD.MM format
- `date` - Date in DD.MM format
- `note` - Note text
- `month` - Month number
- `year` - Year
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

## 🔧 **Advanced Features**

### **Row Level Security (RLS)**
- All tables have RLS enabled
- Default policies allow authenticated users full access
- Customize policies based on your authentication needs

### **Automatic Timestamps**
- `created_at` - Set when record is created
- `updated_at` - Automatically updated on every change

### **Performance Indexes**
- Indexes on frequently queried fields
- Optimized for month/year queries
- Employee ID lookups

### **Data Integrity**
- Foreign key constraints
- Cascade deletes for related records
- Enum types for shift and info types

## 📱 **Using the Export Feature**

### **Export Button Location**
The **Supabase** button is located in the main toolbar next to the regular Export button.

### **What Gets Exported**
- All employee data
- All shift assignments for the current month
- All holidays and vacations
- Month information and day notes
- Metadata about the export

### **Export Formats**
1. **JSON Export** - Raw data for programmatic use
2. **SQL Export** - Ready-to-run SQL statements

## 🚨 **Important Notes**

### **Data Format**
- Dates are stored in DD.MM format (e.g., "15.08")
- Months are stored as numbers (0-11, where 0 = January)
- Years are stored as full numbers (e.g., 2025)

### **ID Generation**
- Employee IDs are preserved from the original system
- Assignment IDs are generated as `{date}-{shift}`
- Vacation IDs are generated as `{employeeId}-{startDate}-{endDate}`

### **Custom Hours**
- Stored as JSONB for flexibility
- Can be queried using PostgreSQL JSON operators
- Example: `SELECT * FROM employees WHERE custom_hours ? '15.08-early'`

## 🔍 **Sample Queries**

### **Get All Assignments for September 2025**
```sql
SELECT 
    a.date,
    a.shift,
    e.name as employee_name,
    e.color
FROM assignments a
JOIN employees e ON a.employee_id = e.id
WHERE a.month = 8 AND a.year = 2025
ORDER BY a.date, a.shift;
```

### **Get Employee Vacation Summary**
```sql
SELECT 
    e.name,
    COUNT(v.id) as vacation_count,
    STRING_AGG(v.start_date || '-' || v.end_date, ', ') as vacation_periods
FROM employees e
LEFT JOIN vacations v ON e.id = v.employee_id
WHERE v.month = 8 AND v.year = 2025
GROUP BY e.id, e.name;
```

### **Get Monthly Statistics**
```sql
SELECT * FROM schedule_summary 
WHERE month = 8 AND year = 2025;
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Permission Denied**
- Check RLS policies
- Ensure user is authenticated
- Verify table permissions

#### **Data Not Importing**
- Check SQL syntax
- Verify table names match
- Check for constraint violations

#### **Performance Issues**
- Ensure indexes are created
- Check query execution plans
- Consider partitioning for large datasets

### **Getting Help**
- Check Supabase logs in dashboard
- Use `EXPLAIN ANALYZE` for slow queries
- Verify data types match schema

## 🔄 **Migration Workflow**

### **Complete Migration Process**
1. **Export** data from ShiftManager2
2. **Set up** Supabase project
3. **Run** schema creation script
4. **Import** data using SQL script
5. **Verify** data integrity
6. **Test** application functionality

### **Rollback Plan**
- Keep original ShiftManager2 data
- Export can be re-run anytime
- Supabase data can be cleared and re-imported

## 📈 **Future Enhancements**

### **Potential Improvements**
- Real-time data synchronization
- Multi-tenant support
- Advanced reporting and analytics
- API endpoints for external access
- Automated backups and archiving

### **Integration Possibilities**
- Connect to other business systems
- Build mobile apps
- Create dashboards and reports
- Integrate with payroll systems

---

**Need Help?** Check the Supabase documentation or create an issue in the ShiftManager2 repository.
