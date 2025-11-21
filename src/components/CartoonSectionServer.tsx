import { CartoonSection } from "./CartoonSection";
import { CartoonCardProps } from "./CartoonCard";

interface CartoonSectionServerProps {
  title: string;
  description?: string;
  cartoonType: "manga" | "novel";
  type: string;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
  initialData?: CartoonCardProps[];
}

/**
 * Server-side rendered wrapper for CartoonSection
 * This component can accept pre-fetched data to improve LCP
 * If initialData is provided, it will be used instead of client-side fetching
 */
export function CartoonSectionServer({
  title,
  description,
  cartoonType,
  type,
  itemsPerView,
  className,
  initialData,
}: CartoonSectionServerProps) {
  return (
    <CartoonSection
      title={title}
      description={description}
      cartoonType={cartoonType}
      type={type}
      itemsPerView={itemsPerView}
      className={className}
      initialData={initialData}
    />
  );
}

