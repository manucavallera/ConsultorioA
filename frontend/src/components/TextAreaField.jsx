import { memo } from "react";

const TextAreaField = memo(function TextAreaField({
  name,
  placeholder,
  label,
  rows = 3,
  value,
  onChange,
}) {
  return (
    <div>
      <label className='block text-sm sm:text-base font-medium text-gray-700 mb-2'>
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        className='w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl 
          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700
          shadow-sm hover:shadow-md resize-none text-sm sm:text-base'
      />
    </div>
  );
});

export default TextAreaField;
