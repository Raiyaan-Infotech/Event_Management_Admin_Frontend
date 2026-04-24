import {
  Sliders,
  Users,
  Briefcase,
  Handshake,
  Calendar,
  Images,
  Star,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

export interface HomeBlock {
  block_type: string;
  variant: string;
  is_visible: boolean;
}

export interface BlockVariant {
  id: string;
  label: string;
}

export interface BlockCatalogEntry {
  block_type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  variants: BlockVariant[];
  preview_image?: string;
}

export const BLOCK_CATALOG: BlockCatalogEntry[] = [
  {
    block_type:  'simple_slider',
    label:       'Simple Slider',
    icon:        Sliders,
    description: 'Basic image slider from Home Slider → Simple Slider',
    variants: [
      { id: 'variant_1', label: 'Classic Full-Width' },
      { id: 'variant_2', label: 'Split Text + Image' },
    ],
    preview_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
  },
  {
    block_type:  'advance_slider',
    label:       'Advance Slider',
    icon:        Sliders,
    description: 'Advanced slider with overlays from Home Slider → Advance Slider',
    variants: [
      { id: 'variant_1', label: 'Hero Full-Height' },
      { id: 'variant_2', label: 'Multi-Slide Thumbnails' },
    ],
    preview_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  },
  {
    block_type:  'about_us',
    label:       'About Us',
    icon:        Users,
    description: 'Company bio and information from your vendor profile',
    variants: [
      { id: 'variant_1', label: 'Left Text / Right Image' },
      { id: 'variant_2', label: 'Centered with Stats' },
    ],
  },
  {
    block_type:  'portfolio_clients',
    label:       'Portfolio — Clients',
    icon:        Briefcase,
    description: 'Client logos from Portfolio Management → Clients',
    variants: [
      { id: 'variant_1', label: 'Logo Grid' },
      { id: 'variant_2', label: 'Scrolling Marquee' },
    ],
  },
  {
    block_type:  'portfolio_sponsors',
    label:       'Portfolio — Sponsors',
    icon:        Handshake,
    description: 'Sponsor logos from Portfolio Management → Sponsors',
    variants: [
      { id: 'variant_1', label: 'Logo Grid' },
      { id: 'variant_2', label: 'Cards with Name' },
    ],
  },
  {
    block_type:  'portfolio_events',
    label:       'Portfolio — Events',
    icon:        Calendar,
    description: 'Event showcase from Portfolio Management → Events',
    variants: [
      { id: 'variant_1', label: 'Cards Grid' },
      { id: 'variant_2', label: 'List with Image' },
    ],
  },
  {
    block_type:  'gallery',
    label:       'Gallery',
    icon:        Images,
    description: 'Event photo gallery from Website → Gallery',
    variants: [
      { id: 'variant_1', label: 'Uniform Grid' },
      { id: 'variant_2', label: 'Masonry Grid' },
    ],
  },
  {
    block_type:  'testimonial',
    label:       'Testimonials',
    icon:        Star,
    description: 'Customer reviews from Website → Testimonials',
    variants: [
      { id: 'variant_1', label: 'Quote Cards Grid' },
      { id: 'variant_2', label: 'Single Carousel' },
    ],
  },
  {
    block_type:  'subscription',
    label:       'Subscription Plans',
    icon:        CreditCard,
    description: "Pricing plans from your vendor's subscription",
    variants: [
      { id: 'variant_1', label: 'Pricing Cards' },
      { id: 'variant_2', label: 'Comparison Table' },
    ],
  },
];
