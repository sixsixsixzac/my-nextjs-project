/**
 * Constructs image URL from path
 */
export function constructImageUrl(path: string | null, defaultPath: string): string {
  if (!path) return defaultPath;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return defaultPath.includes("post_img") 
    ? `/images/post_img/${path}`
    : `/images/${path}`;
}

/**
 * Constructs author avatar URL
 */
export function constructAuthorAvatarUrl(userImg: string | null): string | undefined {
  if (!userImg) return undefined;
  
  // Check for invalid/missing avatar indicators
  if (
    userImg === "none.png" ||
    userImg === "avatars/none.png" ||
    userImg.includes("none.png") ||
    userImg.trim() === ""
  ) {
    return undefined;
  }
  
  // If it's already a full URL, return as-is
  if (userImg.startsWith("http://") || userImg.startsWith("https://")) {
    return userImg;
  }
  
  // Handle new uploads path (uploads/avatars/...)
  if (userImg.startsWith("uploads/")) {
    return `/${userImg}`;
  }
  
  // Handle legacy paths that might not exist
  // Only construct URL if it doesn't look like an invalid path
  if (userImg.startsWith("avatars/")) {
    return `/images/${userImg}`;
  }
  
  return `/images/${userImg}`;
}

