-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  notes TEXT,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_method TEXT NOT NULL DEFAULT 'Cash On Delivery',
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- Create Settings Table (Single row)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  hero_cta_text TEXT,
  hero_cta_link TEXT,
  footer_about TEXT,
  footer_links JSONB DEFAULT '[]',
  footer_social JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Settings Row
INSERT INTO public.settings (
  hero_title, 
  hero_subtitle, 
  hero_image, 
  hero_cta_text, 
  hero_cta_link, 
  footer_about,
  footer_links,
  footer_social
) VALUES (
  'Mailand Cosmetics', 
  'Discover the essence of pure beauty.', 
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 
  'Shop Now', 
  '/products', 
  'Mailand is a luxury cosmetics brand dedicated to natural beauty.',
  '[{"title": "Shop", "url": "/products"}, {"title": "About", "url": "/about"}, {"title": "Contact", "url": "/contact"}]',
  '{"instagram": "https://instagram.com", "facebook": "https://facebook.com", "twitter": "https://twitter.com"}'
) ON CONFLICT DO NOTHING;
