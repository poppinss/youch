declare module "youch" {
  class Youch<Error, Request> {
    constructor(error: Error, request: Request);

    /**
     * Returns the source code for a given file. It unable to
     * read file it resolves the promise with a null.
     */
    _getFrameSource(frame: Object): Promise<any>;

    /**
     * Parses the error stack and returns serialized
     * frames out of it.
     */
    _parseError(): Object;

    /**
     * Returns the context with code for a given
     * frame.
     */
    _getContext(frame: Object): Object;

    /**
     * Returns classes to be used inside HTML when
     * displaying the frames list.
     */
    _getDisplayClasses(frame: Object, index: number): Object;

    /**
     * Compiles the view using HTML
     */
    _compileView(view: string, data: Object): string;

    /**
     * Serializes frame to a usable error object.
     */
    _serializeFrame (frame: Object): Object;

    /**
     * Returns whether frame belongs to nodejs
     * or not.
     */
    _isNode (frame: Object): boolean;

    /**
     * Returns whether code belongs to the app
     * or not.
     *
     * @return {Boolean} [description]
     */
    _isApp (frame: Object): boolean;

    /**
     * Returns whether frame belongs to a node_module
     * or not
     */
    private _isNodeModule (frame: Object): boolean;

    /**
     * Serializes stack to Mustache friendly object to
     * be used within the view. Optionally can pass
     * a callback to customize the frames output.
     */
    _serializeData (stack: Object, callbac: Function): Object;

    /**
     * Returns a serialized object with important
     * information.
     */
    _serializeRequest(): Object;

    /**
     * Stores the link `callback` which
     * will be processed when rendering
     * the HTML view.
     */
    addLink(callback: Function): this;

    /**
     * Returns error stack as JSON.
     */
    toJSON(): Promise<Object>;

    /**
     * Returns HTML representation of the error stack
     * by parsing the stack into frames and getting
     * important info out of it.
     */
    toHTML(): Promise<string>;
  }

  export default Youch;
}
