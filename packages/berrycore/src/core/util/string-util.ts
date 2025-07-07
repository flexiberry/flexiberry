export class StringUtil {
  // Utility to get nested value by path like "user.profile.name" or "items[0].id"
  public static getValueByPath(obj: any, path: string): any {
    if (path.startsWith("response.")) {
      path = path.slice("response.".length);
    }
    return path
      .replace(/\[(\w+)\]/g, ".$1") // convert [0] to .0
      .split(".")
      .filter(Boolean)
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
        obj
      );
  }
}
