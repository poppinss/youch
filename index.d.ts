declare module "youch" {
  class Youch<Error, Request> {
    constructor(error: Error, request: Request);

    /**
     * How many lines should be displayed around the
     * error line of the stack trace.
     */
    codeContext: number;

    /**
     * Stores the link `callback` which
     * will be processed when rendering
     * the HTML view.
     */
    addLink(callback: Function): this;

    /**
     * Returns error stack as JSON.
     */
    toJSON(): Promise<{
      error: {
        message: string;
        name: string;
        status: number;
        frames: {
          file: string;
          filePath: string;
          line: number;
          column: number;
          callee: string;
          calleeShort: string;
          context: {
            start: number;
            pre: string;
            line: string;
            post: string;
          };
          isModule: boolean;
          isNative: boolean;
          isApp: boolean;
        }[];
      };
    }>;

    /**
     * Returns HTML representation of the error stack
     * by parsing the stack into frames and getting
     * important info out of it.
     */
    toHTML(): Promise<string>;
  }

  export default Youch;
}
