declare type Variable = {
  name: string;
  value: string;
  source: string;
};

declare type Rule = {
  name: string;
  command: string | Array<string>;
  description?: string | Array<string>;
  source: string;
};

declare type Build = {
  output: string;
  rule: string;
  inputs: Array<string>;
  implicitInputs: Array<string>;
  source: string;
};

declare function declare(name: string, value: string): void;

declare function declareOrAppend(
  name: string,
  value: string,
  sep?: string
): void;

declare function getVar(name: string): string | null;

declare function rule(
  name: string,
  opts: {
    command: string | Array<string>;
    description?: string | Array<string>;
  }
): void;

declare function build(
  output: string,
  rule: string,
  inputs: Array<string>,
  implicitInputs?: Array<string>
): void;

declare function rel(path?: string): string;

declare function builddir(path?: string): string;

declare const env: { [key: string]: string | null | undefined };

/** Re-export of globby.sync. */
declare function glob(
  patterns: string | Array<string>,
  options: {
    /**
     * Return the absolute path for entries.
     *
     * @default false
     */
    absolute?: boolean;

    /**
     * If set to `true`, then patterns without slashes will be matched against
     * the basename of the path if it contains slashes.
     *
     * @default false
     */
    baseNameMatch?: boolean;

    /**
     * Enables Bash-like brace expansion.
     *
     * @default true
     */
    braceExpansion?: boolean;

    /**
     * Enables a case-sensitive mode for matching files.
     *
     * @default true
     */
    caseSensitiveMatch?: boolean;

    /**
     * Specifies the maximum number of concurrent requests from a reader to read
     * directories.
     *
     * @default os.cpus().length
     */
    concurrency?: number;

    /**
     * The current working directory in which to search.
     *
     * @default process.cwd()
     */
    cwd?: string;

    /**
     * Specifies the maximum depth of a read directory relative to the start
     * directory.
     *
     * @default Infinity
     */
    deep?: number;

    /**
     * Allow patterns to match entries that begin with a period (`.`).
     *
     * @default false
     */
    dot?: boolean;

    /**
     * Enables Bash-like `extglob` functionality.
     *
     * @default true
     */
    extglob?: boolean;

    /**
     * Indicates whether to traverse descendants of symbolic link directories.
     *
     * @default true
     */
    followSymbolicLinks?: boolean;

    /**
     * Custom implementation of methods for working with the file system.
     *
     * @default fs.*
     */
    fs?: any;

    /**
     * Enables recursively repeats a pattern containing `**`.
     * If `false`, `**` behaves exactly like `*`.
     *
     * @default true
     */
    globstar?: boolean;

    /**
     * An array of glob patterns to exclude matches.
     * This is an alternative way to use negative patterns.
     *
     * @default []
     */
    ignore?: string[];

    /**
     * Mark the directory path with the final slash.
     *
     * @default false
     */
    markDirectories?: boolean;

    /**
     * Returns objects (instead of strings) describing entries.
     *
     * @default false
     */
    objectMode?: boolean;

    /**
     * Return only directories.
     *
     * @default false
     */
    onlyDirectories?: boolean;

    /**
     * Return only files.
     *
     * @default true
     */
    onlyFiles?: boolean;

    /**
     * Enables an object mode (`objectMode`) with an additional `stats` field.
     *
     * @default false
     */
    stats?: boolean;

    /**
     * By default this package suppress only `ENOENT` errors.
     * Set to `true` to suppress any error.
     *
     * @default false
     */
    suppressErrors?: boolean;

    /**
     * Throw an error when symbolic link is broken if `true` or safely
     * return `lstat` call if `false`.
     *
     * @default false
     */
    throwErrorOnBrokenSymbolicLink?: boolean;

    /**
     * Ensures that the returned entries are unique.
     *
     * @default true
     */
    unique?: boolean;

    /**
     * Respect ignore patterns in `.gitignore` files that apply to the globbed files.
     *
     * @default false
     */
    readonly gitignore?: boolean;
  }
): Array<string>;
