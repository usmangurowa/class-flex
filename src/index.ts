import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface VariantConfig<V extends object = object> {
  variants?: {
    [K in keyof V]?: {
      [key: string]: string;
    };
  };
  defaultVariants?: {
    [K in keyof V]?: string;
  };

  responsive?: {
    [key: string]: string;
  };

  className?: string;
  class?: string;
}

type ConfigFunction<V extends object = object> = (prop: V) => VariantConfig<V>;

const falsyToString = <T extends unknown>(value: T) =>
  typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;

const clf = <V extends object = object>(
  base: string,
  config?: VariantConfig<V> | ConfigFunction<V>
) => {
  // if config is a function, call it with the prop
  const resolvedConfig = typeof config === "function" ? config : () => config;

  // return a function that takes a prop and returns a string of classnames
  return (prop: V) => {
    //   destructure the values from the resolvedConfig
    const {
      defaultVariants = {},
      variants = {},
      class: _class = "",
      className = "",
      responsive = {},
    }: VariantConfig = resolvedConfig(prop);

    // if there are no variants, return the base class
    //   if (!variants) return base;
    // map over the variants and return the classnames
    const classes = Object.keys(variants).map((v: keyof typeof variants) => {
      // get the variant prop and default variant prop
      const variantProp = prop?.[v as keyof typeof prop];
      const defaultVariantProp = defaultVariants?.[v];

      // if the variant prop or defaultVariantProp is null, return an empty string
      if (variantProp === null && defaultVariantProp === null) return "";

      // get the variant key from the variant prop or defaultVariantProp
      const variantKey = (falsyToString(variantProp) ||
        falsyToString(defaultVariantProp)) as keyof (typeof variants)[typeof v];

      // return the variant value from the variant key
      return variants[v][variantKey] || "";
    });

    // map over the responsive object and return the classnames
    const responsiveClasses = Object.keys(responsive).map(
      (v: keyof typeof responsive) => {
        // get the responsive prop
        return responsive?.[v]
          ?.split(" ")
          ?.map((c: string) => (v && c ? `${v}:${c}` : ""));
      }
    );

    // flatten the array
    return twMerge(clsx(base, classes, responsiveClasses, className, _class));
  };
};

export default clf;
