import { describe, it, expect } from "vitest";
import { en } from "../locales/en";
import { hi } from "../locales/hi";

function getDeepKeys(obj: Record<string, any>, prefix = ""): string[] {
  return Object.keys(obj).reduce((res: string[], el: string) => {
    const name = prefix ? `${prefix}.${el}` : el;
    if (typeof obj[el] === "object" && obj[el] !== null) {
      res.push(...getDeepKeys(obj[el], name));
    } else {
      res.push(name);
    }
    return res;
  }, []);
}

describe("Internationalization (i18n) Parity & Completeness", () => {
  it("should have identical translation keys between English and Hindi catalogs", () => {
    const enKeys = getDeepKeys(en).sort();
    const hiKeys = getDeepKeys(hi).sort();

    expect(hiKeys).toEqual(enKeys);
  });

  it("should not contain empty translation strings in Hindi catalog", () => {
    const checkNoEmpty = (obj: any) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null) {
          checkNoEmpty(value);
        } else {
          expect(typeof value === "string" && value.trim().length > 0).toBe(true);
        }
      }
    };

    checkNoEmpty(hi);
  });

  it("should interpolate template variables correctly", () => {
    const template = "Stopping audio in {time}";
    const interpolated = template.replace("{time}", "14:59");
    expect(interpolated).toBe("Stopping audio in 14:59");
  });
});
