export function isPathActive(
  route: string,
  currentPath: string,
  exact: boolean = false
) {
  if (exact) {
    return route === currentPath;
  } else if (route === "/") {
    return currentPath === "/";
  } else if (currentPath.startsWith(route)) {
    return true;
  } else {
    return false;
  }
}
