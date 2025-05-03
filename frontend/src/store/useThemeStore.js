import { create } from "zustand";

const useThemeStore = create((set) => ({
    theme: localStorage.getItem("linkify-theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("linkify-theme", theme);
        set({theme});
    },
}));

export default useThemeStore;