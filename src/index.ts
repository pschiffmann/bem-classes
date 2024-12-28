/** The default export from the `.module.css` file. */
type CssModuleType = Record<string, string>;

type ElementClass = `${string}__${string}`;
type ModifierClass = `${string}--${string}`;

/** Returns the keys in `C` that are BEM block class names. */
type FindBlockNames<C extends CssModuleType> = Exclude<
  keyof C & string,
  ElementClass | ModifierClass
>;

/** Returns the BEM element names of block `B` in `C`. */
type FindElementNames<C extends CssModuleType, B extends string> = Exclude<
  StripElementPrefix<B, keyof C & string>,
  ModifierClass
>;

type StripElementPrefix<
  B extends string,
  S extends string
> = S extends `${B}__${infer E}` ? E : never;

type ModifierArg<C extends CssModuleType, P extends string> =
  | StripModifierPrefix<P, keyof C & string>
  | null
  | undefined
  | false;

type StripModifierPrefix<
  P extends string,
  S extends string
> = S extends `${P}--${infer M}` ? M : never;

export interface BemClasses<C extends CssModuleType, B extends string> {
  block(
    external?: string | null,
    ...modifiers: readonly ModifierArg<C, B>[]
  ): string;
  element<E extends FindElementNames<C, B>>(
    element: E,
    external?: string | null,
    ...modifiers: readonly ModifierArg<C, `${B}__${E}`>[]
  ): string;
}

/**
 * Creates a BEM class name generator using the class name aliases in
 * `cssModule` and the `block` prefix.
 *
 * Usage:
 *
 * ```tsx
 * import { bemClasses } from "@pschiffmann/bem-classes";
 * import cssModule from "./my-component.module.css";
 *
 * const cls = bemClasses(cssModule, "btn");
 *
 * export function Button({ className, label, iconName }) {
 *   return (
 *     <button className={cls.block(className, !!iconName && "has-icon")}>
 *       <span className={cls.element("label")}>{label}</span>
 *       {iconName && (
 *         <i className={cls.element("icon")}>{iconName}</i>
 *       )}
 *     </button>
 *   );
 * }
 * ```
 */
export function bemClasses<
  C extends CssModuleType,
  B extends FindBlockNames<C>
>(cssModule: C, block: B): BemClasses<C, B> {
  return {
    block(external, ...modifiers) {
      let result = external
        ? `${external} ${cssModule[block]!}`
        : cssModule[block]!;
      for (const modifier of modifiers) {
        if (modifier) result += ` ${cssModule[`${block}--${modifier}`]}`;
      }
      return result;
    },
    element(element, external, ...modifiers) {
      const prefix = `${block}__${element}`;
      let result = external
        ? `${external} ${cssModule[prefix]!}`
        : cssModule[prefix]!;
      for (const modifier of modifiers) {
        if (modifier) result += ` ${cssModule[`${prefix}--${modifier}`]}`;
      }
      return result;
    },
  };
}
