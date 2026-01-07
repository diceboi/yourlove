import H3 from "./Texts/H3";
import Paragraph from "./Texts/Paragraph";

/**
 * Conditional wrapper for product information sections
 * Only renders if content is provided
 */
export default function ProductInfoSection({ title, children, show = true }) {
  // Don't render if explicitly hidden or no children
  if (!show || !children) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {title && <H3>{title}</H3>}
      {children}
    </div>
  );
}
