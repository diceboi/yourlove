/**
 * Reusable table component for displaying product specifications
 * Two-column layout with label and value
 * Only shows rows that have values
 */
export default function ProductSpecsTable({ specs }) {
  if (!specs || specs.length === 0) {
    return null;
  }

  // Filter out specs without values
  const validSpecs = specs.filter(spec => spec.value);

  if (validSpecs.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {validSpecs.map((spec, index) => (
            <tr
              key={index}
              className={`border-b border-[var(--border)] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[var(--grey-bg)]'
              }`}
            >
              <td className="py-3 px-4 font-medium text-[var(--secondary-text)] w-1/3">
                {spec.label}
              </td>
              <td className="py-3 px-4 text-[var(--black)]">
                {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
