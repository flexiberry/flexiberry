export class InterpolationUtil {
  public static extractInterpolation(input: string): string[] {
    const regex = /{{(.*?)}}/g;
    const keys: string[] = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      keys.push(match[1]); // Extract the key from the match
    }

    return keys;
  }

  public static replaceInterpolation(
    input: string | undefined,
    keys: string[] | undefined,
    values: { [key: string]: string } | undefined
  ): string {
    if (!input) {
      return "";
    }
    if (!values) {
      return input;
    }
    const regex = /{{(.*?)}}/g;
    let match;
    let result = input;
    while ((match = regex.exec(input)) !== null) {
      const key = match[1];
      if (keys?.includes(key)) {
        result = result.replace(`{{${key}}}`, values[key]);
      }
    }
    return result;
  }
}
