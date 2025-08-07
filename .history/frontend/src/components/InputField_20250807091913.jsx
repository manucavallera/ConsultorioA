import { memo } from "react";

// 🎯 COMPONENTE INPUT COMPLETAMENTE AISLADO
const InputField = memo(function InputField({
  name,
  placeholder,
  type = "text",
  required = false,
  icon,
  min,
  className = "",
  value,
  onChange,
}) {
  console.log(`🔄 InputField ${name} renderizado - valor:`, value);

  const handleChange = (e) => {
    console.log(`✏️ ${name} cambió:`, e.target.value);
    onChange(e);
  };

  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10'>
          <span className='text-gray-400 text-sm sm:text-base'>{icon}</span>
        </div>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value || ""}
        onChange={handleChange}
        required={required}
        min={min}
        className={`w-full ${
          icon ? "pl-10 sm:pl-12" : "pl-3 sm:pl-4"
        } pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl 
          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700
          shadow-sm hover:shadow-md text-sm sm:text-base`}
      />
    </div>
  );
});

export default InputField;
