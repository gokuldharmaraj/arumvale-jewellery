export const getImageUrl = (path) => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_URL}${path}`;
};
