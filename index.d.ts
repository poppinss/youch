declare module "youch" {

  interface YouchOptionsContract {
    /**
     * Number of lines to be displayed above the error
     * in the stack trace.
     */
    preLines?: number;

    /**
     * Number of lines to be displayed below the error
     * in the stack trace.
     */
    postLines?: number;
  }

  class Youch<Error, Request> {
    constructor(error: Error, request: Request, options?: YouchOptionsContract);

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
        cause?: any;
        help?: any;
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
