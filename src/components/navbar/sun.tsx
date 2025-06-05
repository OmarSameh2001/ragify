"use client";
import { Sunny } from "@mui/icons-material";

const SunIcon = () => {
  return (
    <div className="flex items-center justify-center">
      {/* {theme === "light" ? <FaSun onClick={toggleTheme} color="orange"/> : <FaMoon onClick={toggleTheme} color="gray"/>} */}
      <button
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-500 cursor-pointer"
        onClick={() => document.documentElement.classList.toggle("dark")}
      >
        <Sunny className="w-6 h-6 text-yellow-500" />
      </button>
    </div>
  );
};

export default SunIcon;
