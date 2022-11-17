/**
 * Any value which can be converted to a string. Various shinobi API functions accept values of this type.
 *
 * - Arrays will be joined together with " " (a single space character) as the separator
 * - numbers and booleans will be coerced to string
 * - undefined and null will be ignored (omitted when appearing in objects/arrays, replaced with "" otherwise)
 */
declare type Value =
  | string
  | boolean
  | number
  | undefined
  | null
  | Array<string | boolean | number | undefined | null>;

/**
 * Adds a variable declaration to the top of the final build.ninja.
 *
 * Use a dollar sign to reference this variable in rules/etc. For instance, if you called:
 *
 * ```ts
 * declare("some_name", "some_value");
 * ```
 *
 * Then you could reference that in a rule by writing "$some_name".
 *
 * @param name The name of the variable, which will be on the left side of the equals sign.
 * @param value The value of the variable, which will be on the right side of the equals sign.
 */
declare function declare(name: string, value: Value): void;

/**
 * Adds or modifies a variable declaration in the final build.ninja.
 *
 * If a variable with that name already exists, append this value to the end of
 * it (using the provided separator, or `" "` if unspecified).
 *
 * If it doesn't already exist, define it (ignoring the separator).
 *
 * @param name The name of the variable, which will be on the left side of the equals sign.
 * @param value If the variable already exists, this will be appended to end. Otherwise, the variable will be defined with this value.
 * @param sep If the variable already exists, this string will be used to join `value` to the end of the variable's existing value. If unspecified, defaults to `" "`.
 */
declare function declareOrAppend(
  name: string,
  value: Value,
  sep?: string
): void;

/**
 * Read the value of a declared variable in the final build.ninja, as defined thus far.
 *
 * NOTE: Load order of your scripts can affect what this returns; if you want
 * to read a variable in one place but don't declare it until later, you won't
 * get the declared value.
 *
 * @param name The name of the variable to read
 */
declare function getVar(name: string): string | null;

/**
 * Define a build rule to appear in the final build.ninja.
 *
 * @param name The name of the rule
 * @param properties Various values relating to the rule's definition.
 */
declare function rule(
  name: string,
  properties: {
    /**
     * required; the command line to run. Each rule may have only one command
     * declaration, but it's possible to [run multiple commands by relying
     * on your system shell](https://ninja-build.org/manual.html#ref_rule_command).
     */
    command: Value;

    /**
     * a short description of the command, used to pretty-print the command as
     * it’s running. The -v flag controls whether to print the full command or
     * its description; if a command fails, the full command line will always
     * be printed before the command’s output.
     */
    description?: Value;

    /**
     * path to an optional `Makefile` that contains extra *implicit dependencies*
     * (see [the reference on dependency types](https://ninja-build.org/manual.html#ref_dependencies)).
     *
     * This is explicitly to support C/C++ header dependencies; see [the full discussion](https://ninja-build.org/manual.html#ref_headers).
     */
    depfile?: Value;

    /**
     * (Available since Ninja 1.3.) if present, must be one of `gcc` or `msvc` to
     * specify special dependency processing. See [the full discussion](https://ninja-build.org/manual.html#ref_headers).
     * The generated database is stored as `.ninja_deps` in the builddir, see
     * [the discussion of `builddir`](https://ninja-build.org/manual.html#ref_toplevel).
     */
    deps?: Value;

    /**
     * (Available since Ninja 1.5.) defines the string which should be stripped
     * from msvc’s /showIncludes output. Only needed when `deps = msvc` and no
     * English Visual Studio version is used.
     */
    msvc_deps_prefix?: Value;

    /**
     * if present, specifies that this rule is used to re-invoke the generator
     * program. Files built using `generator` rules are treated specially in
     * two ways: firstly, they will not be rebuilt if the command line changes;
     * and secondly, they are not cleaned by default.
     */
    generator?: Value;

    /**
     * if present, causes Ninja to re-stat the command’s outputs after
     * execution of the command. Each output whose modification time the
     * command did not change will be treated as though it had never needed to
     * be built. This may cause the output’s reverse dependencies to be removed
     * from the list of pending build actions.
     */
    restat?: Value;

    /**
     * if `rspfile` and `rspfile_content` are both present, Ninja will use a
     * response file for the given command, i.e. write the selected string
     * (`rspfile_content`) to the given file (`rspfile`) before calling the
     * command and delete the file after successful execution of the command.
     *
     * This is particularly useful on Windows OS, where the maximal length of a
     * command line is limited and response files must be used instead.
     *
     * Use it like in the following example:
     *
     * ```ts
     * rule("link", {
     *   command: `link.exe /OUT$out [usual link flags here] @$out.rsp`,
     *   rspfile: `$out.rsp`,
     *   rspfile_content: `$in`
     * });
     *
     * build({
     *   output: "myapp.exe",
     *   rule: "link",
     *   inputs: ["a.obj", "b.obj", ...possibly many more .obj files... ],
     * });
     * ```
     */
    rspfile?: Value;

    /**
     * if `rspfile` and `rspfile_content` are both present, Ninja will use a
     * response file for the given command, i.e. write the selected string
     * (`rspfile_content`) to the given file (`rspfile`) before calling the
     * command and delete the file after successful execution of the command.
     *
     * This is particularly useful on Windows OS, where the maximal length of a
     * command line is limited and response files must be used instead.
     *
     * Use it like in the following example:
     *
     * ```ts
     * rule("link", {
     *   command: `link.exe /OUT$out [usual link flags here] @$out.rsp`,
     *   rspfile: `$out.rsp`,
     *   rspfile_content: `$in`
     * });
     *
     * build({
     *   output: "myapp.exe",
     *   rule: "link",
     *   inputs: ["a.obj", "b.obj", ...possibly many more .obj files... ],
     * });
     * ```
     */
    rspfile_content?: Value;
  }
): void;

/**
 * Add instructions to the final build.ninja that instruct ninja how to build
 * the file at `output`.
 */
declare function build(config: {
  /** The file that will be created. */
  output: string;

  /** The name of the rule that should be used to create the file, as defined via {@link rule}. */
  rule: string;

  /** The file(s) which will be passed to the rule as `$in`. Also, it instructs ninja to re-run this build when these files change. */
  inputs: Value;

  /** Additional files that, if changed, mean that ninja should re-run this build. */
  implicitInputs?: Value;

  /** Any additional variables to put into the rule's scope when building its command-line. The rule can access these by name using `$`, the same way it does with `$in` and `$out`. */
  ruleVariables?: { [name: string]: Value };
}): void;

/**
 * Resolves the given `path` into an absolute path relative to the containing
 * directory of the current js file being fed into shinobi.
 *
 * For instance, if you have these two files:
 * - `/home/me/Code/myproject/build.ninja.js`
 * - `/home/me/Code/myproject/main.c`,
 *
 * And you write this in `/home/me/Code/myproject/build.ninja.js`:
 * ```ts
 * var mainC = rel("main.c"); // or rel("./main.c");
 * ```
 *
 * Then `mainC` will be `"/home/me/Code/myproject/main.c"`.
 *
 * You can also use `.` and `..`; if you wrote this in  `/home/me/Code/myproject/build.ninja.js`:
 * ```ts
 * var rootDir = rel(".");
 * var parentDir = rel("..");
 * ```
 *
 * Then `rootDir` will be `"/home/me/Code/myproject"` and `parentDir` will be `"/home/me/Code"`.
 *
 * If called with no arguments, this function returns the containing directory
 * of the current js file; ie. the same as `rel(".")`.
 */
declare function rel(path?: string): string;

/**
 * shinobi provides a built-in variable for all ninja files called `builddir`,
 * which defaults to "build". This variable is intended to be used to specify
 * the directory in which to store build artifacts. You can use this variable
 * in your rules/builds/etc by writing `$builddir`, and you can override its
 * value by setting the environment variable BUILDDIR when running shinobi.
 *
 * This JavaScript function named `builddir` prepends the given `path` with
 * the string `"$builddir/"`. If called with no arguments, this function
 * returns the string `"$builddir"`.
 */
declare function builddir(path?: string): string;

/**
 * Alias for Node's {@link process.env}; used to read and write environment
 * variables.
 */
declare const env: { [key: string]: string | null | undefined };

/**
 * Re-export of [globby](https://www.npmjs.com/package/globby).sync, for
 * resolving glob strings into lists of files.
 */
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
