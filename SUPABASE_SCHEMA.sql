-- Supabase Database Schema for ShiftManager2
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE shift_type AS ENUM ('early', 'night');
CREATE TYPE info_type AS ENUM ('frontend', 'backend');

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    custom_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(255) PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    shift shift_type NOT NULL,
    employee_id VARCHAR(255) REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id VARCHAR(10) PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    name VARCHAR(255) DEFAULT 'Holiday',
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vacations table
CREATE TABLE IF NOT EXISTS vacations (
    id VARCHAR(255) PRIMARY KEY,
    employee_id VARCHAR(255) REFERENCES employees(id) ON DELETE CASCADE,
    start_date VARCHAR(10) NOT NULL,
    end_date VARCHAR(10) NOT NULL,
    description TEXT DEFAULT '',
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Month infos table
CREATE TABLE IF NOT EXISTS month_infos (
    id VARCHAR(255) PRIMARY KEY,
    month VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    info TEXT NOT NULL,
    type info_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Day notes table
CREATE TABLE IF NOT EXISTS day_notes (
    id VARCHAR(10) PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    note TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_month_year ON assignments(month, year);
CREATE INDEX IF NOT EXISTS idx_assignments_employee_id ON assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date);

CREATE INDEX IF NOT EXISTS idx_holidays_month_year ON holidays(month, year);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);

CREATE INDEX IF NOT EXISTS idx_vacations_month_year ON vacations(month, year);
CREATE INDEX IF NOT EXISTS idx_vacations_employee_id ON vacations(employee_id);

CREATE INDEX IF NOT EXISTS idx_month_infos_month_year ON month_infos(month, year);
CREATE INDEX IF NOT EXISTS idx_day_notes_month_year ON day_notes(month, year);

-- Create Row Level Security (RLS) policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_notes ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your authentication needs)
-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON employees
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON assignments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON holidays
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON vacations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON month_infos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON day_notes
    FOR ALL USING (auth.role() = 'authenticated');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacations_updated_at BEFORE UPDATE ON vacations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_month_infos_updated_at BEFORE UPDATE ON month_infos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_notes_updated_at BEFORE UPDATE ON day_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for easy data access
CREATE OR REPLACE VIEW schedule_summary AS
SELECT 
    a.month,
    a.year,
    COUNT(DISTINCT a.employee_id) as active_employees,
    COUNT(a.id) as total_assignments,
    COUNT(h.id) as total_holidays,
    COUNT(v.id) as total_vacations,
    COUNT(mi.id) as total_month_infos,
    COUNT(dn.id) as total_day_notes
FROM assignments a
LEFT JOIN holidays h ON a.month = h.month AND a.year = h.year
LEFT JOIN vacations v ON a.month = v.month AND a.year = v.year
LEFT JOIN month_infos mi ON a.month = mi.month AND a.year = mi.year
LEFT JOIN day_notes dn ON a.month = dn.month AND a.year = dn.year
GROUP BY a.month, a.year;

-- Insert sample data (optional)
-- INSERT INTO employees (id, name, color) VALUES 
-- ('1', 'Adrian', 'bg-green-200 text-green-800'),
-- ('2', 'Vasil', 'bg-blue-200 text-blue-800'),
-- ('3', 'Sandra', 'bg-purple-200 text-purple-800'),
-- ('4', 'Sabrina', 'bg-orange-200 text-orange-800'),
-- ('5', 'Chiara', 'bg-pink-200 text-pink-800');

-- Grant permissions (adjust based on your needs)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employees', 'assignments', 'holidays', 'vacations', 'month_infos', 'day_notes')
ORDER BY table_name;
