export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-brass"
    />
  );
}
