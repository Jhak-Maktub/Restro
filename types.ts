export interface NavItem {
  label: string;
  href: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  currency: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'outline';
}

export interface StatItem {
  label: string;
  value: string;
  change: string;
  isPositive?: boolean;
  isWarning?: boolean;
}