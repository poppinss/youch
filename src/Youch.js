'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/*
 * youch
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 * Ported to Typescript by AvidCoder123 <github: AvidCoder123>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var cookie = __importStar(require("cookie"));
var mustache_1 = __importDefault(require("mustache"));
var stackTrace = __importStar(require("stack-trace"));
var VIEW_PATH = './error.compiled.mustache';
var startingSlashRegex = /\\|\//;
var viewTemplate = fs.readFileSync(path.join(__dirname, VIEW_PATH), 'utf-8');
var Youch = /** @class */ (function () {
    function Youch(error, request) {
        this.codeContext = 5;
        this._filterHeaders = ['cookie', 'connection'];
        this.error = error;
        this.request = request;
    }
    /**
     * Returns the source code for a given file. It unable to
     * read file it resolves the promise with a null.
     *
     * @param  {Object} frame
     * @return {Promise}
     */
    Youch.prototype._getFrameSource = function (frame) {
        var _this = this;
        var path = frame
            .getFileName()
            .replace(/dist\/webpack:\//g, '') // unix
            .replace(/dist\\webpack:\\/g, ''); // windows
        return new Promise(function (resolve, reject) {
            fs.readFile(path, 'utf-8', function (error, contents) {
                if (error) {
                    resolve(null);
                    return;
                }
                var lines = contents.split(/\r?\n/);
                var lineNumber = frame.getLineNumber();
                resolve({
                    pre: lines.slice(Math.max(0, lineNumber - (_this.codeContext + 1)), lineNumber - 1),
                    line: lines[lineNumber - 1],
                    post: lines.slice(lineNumber, lineNumber + _this.codeContext)
                });
            });
        });
    };
    /**
     * Parses the error stack and returns serialized
     * frames out of it.
     *
     * @return {Object}
     */
    Youch.prototype._parseError = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var stack = stackTrace.parse(_this.error);
            Promise.all(stack.map(function (frame) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (this._isNode(frame)) {
                        return [2 /*return*/, Promise.resolve(frame)];
                    }
                    return [2 /*return*/, this._getFrameSource(frame).then(function (context) {
                            frame.context = context;
                            return frame;
                        })];
                });
            }); }))
                .then(resolve)["catch"](reject);
        });
    };
    /**
     * Returns the context with code for a given
     * frame.
     *
     * @param  {Object}
     * @return {Object}
     */
    Youch.prototype._getContext = function (frame) {
        if (!frame.context) {
            return {};
        }
        return {
            start: frame.getLineNumber() - (frame.context.pre || []).length,
            pre: frame.context.pre.join('\n'),
            line: frame.context.line,
            post: frame.context.post.join('\n')
        };
    };
    /**
     * Returns classes to be used inside HTML when
     * displaying the frames list.
     *
     * @param  {Object}
     * @param  {Number}
     *
     * @return {String}
     */
    Youch.prototype._getDisplayClasses = function (frame, index) {
        var classes = [];
        if (index === 0) {
            classes.push('active');
        }
        if (!frame.isApp) {
            classes.push('native-frame');
        }
        return classes.join(' ');
    };
    /**
     * Compiles the view using HTML
     *
     * @param  {String}
     * @param  {Object}
     *
     * @return {String}
     */
    Youch.prototype._compileView = function (view, data) {
        return mustache_1["default"].render(view, data);
    };
    /**
     * Serializes frame to a usable error object.
     *
     * @param  {Object}
     *
     * @return {Object}
     */
    Youch.prototype._serializeFrame = function (frame) {
        var relativeFileName = frame.getFileName().indexOf(process.cwd()) > -1
            ? frame
                .getFileName()
                .replace(process.cwd(), '')
                .replace(startingSlashRegex, '')
            : frame.getFileName();
        return {
            file: relativeFileName,
            filePath: frame.getFileName(),
            method: frame.getFunctionName(),
            line: frame.getLineNumber(),
            column: frame.getColumnNumber(),
            context: this._getContext(frame),
            isModule: this._isNodeModule(frame),
            isNative: this._isNode(frame),
            isApp: this._isApp(frame)
        };
    };
    /**
     * Returns whether frame belongs to nodejs
     * or not.
     *
     * @return {Boolean} [description]
     */
    Youch.prototype._isNode = function (frame) {
        if (frame.isNative()) {
            return true;
        }
        var filename = frame.getFileName() || '';
        return !path.isAbsolute(filename) && filename[0] !== '.';
    };
    /**
     * Returns whether code belongs to the app
     * or not.
     *
     * @return {Boolean} [description]
     */
    Youch.prototype._isApp = function (frame) {
        return !this._isNode(frame) && !this._isNodeModule(frame);
    };
    /**
     * Returns whether frame belongs to a node_module or
     * not
     *
     * @method _isNodeModule
     *
     * @param  {Object}      frame
     *
     * @return {Boolean}
     *
     * @private
     */
    Youch.prototype._isNodeModule = function (frame) {
        return (frame.getFileName() || '').indexOf('node_modules' + path.sep) > -1;
    };
    /**
     * Serializes stack to Mustache friendly object to
     * be used within the view. Optionally can pass
     * a callback to customize the frames output.
     *
     * @param  {Object}
     * @param  {Function} [callback]
     *
     * @return {Object}
     */
    Youch.prototype._serializeData = function (stack, callback) {
        callback = callback || this._serializeFrame.bind(this);
        return {
            message: this.error.message,
            name: this.error.name,
            status: this.error.status,
            frames: stack instanceof Array === true
                ? stack.filter(function (frame) { return frame.getFileName(); }).map(callback)
                : []
        };
    };
    /**
     * Returns a serialized object with important
     * information.
     *
     * @return {Object}
     */
    Youch.prototype._serializeRequest = function () {
        var _this = this;
        var headers = [];
        Object.keys(this.request.headers).forEach(function (key) {
            if (_this._filterHeaders.indexOf(key) > -1) {
                return;
            }
            headers.push({
                key: key.toUpperCase(),
                value: _this.request.headers[key]
            });
        });
        var parsedCookies = cookie.parse(this.request.headers.cookie || '');
        var cookies = Object.keys(parsedCookies).map(function (key) {
            return { key: key, value: parsedCookies[key] };
        });
        return {
            url: this.request.url,
            httpVersion: this.request.httpVersion,
            method: this.request.method,
            connection: this.request.headers.connection,
            headers: headers,
            cookies: cookies
        };
    };
    /**
     * Stores the link `callback` which
     * will be processed when rendering
     * the HTML view.
     *
     * @param {Function} callback
     *
     * @returns {Object}
     */
    Youch.prototype.addLink = function (callback) {
        if (typeof callback === 'function') {
            this.links.push(callback);
            return this;
        }
        throw new Error('Pass a callback function to "addLink"');
    };
    /**
     * Returns error stack as JSON.
     *
     * @return {Promise}
     */
    Youch.prototype.toJSON = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._parseError()
                .then(function (stack) {
                resolve({
                    error: _this._serializeData(stack)
                });
            })["catch"](reject);
        });
    };
    /**
     * Returns HTML representation of the error stack
     * by parsing the stack into frames and getting
     * important info out of it.
     *
     * @return {Promise}
     */
    Youch.prototype.toHTML = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._parseError()
                .then(function (stack) {
                var data = _this._serializeData(stack, function (frame, index) {
                    var serializedFrame = _this._serializeFrame(frame);
                    serializedFrame.classes = _this._getDisplayClasses(serializedFrame, index);
                    return serializedFrame;
                });
                var request = _this._serializeRequest();
                data.request = request;
                data.links = _this.links.map(function (renderLink) { return renderLink(data); });
                data.loadFA = !!data.links.find(function (link) { return link.includes('fa-'); });
                return resolve(_this._compileView(viewTemplate, data));
            })["catch"](reject);
        });
    };
    return Youch;
}());
exports["default"] = Youch;
