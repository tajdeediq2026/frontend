import type { Metadata } from 'next';
import PrivacyPolicySection from '@/components/PrivacyPolicySection';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | جريدة تجديد',
  description: 'سياسة الخصوصية لجريدة تجديد - تعرف على كيفية تعاملنا مع بياناتك الشخصية',
};

export default function PrivacyPage() {
  return <PrivacyPolicySection />;
}
