<a name="3.2.0"></a>

## [3.1.2](https://github.com/poppinss/youch/compare/v3.1.1...v3.2.0) (2022-05-03)

<a name="3.1.1"></a>

## [3.1.1](https://github.com/poppinss/youch/compare/v3.1.0...v3.1.1) (2022-02-22)

<a name="3.1.0"></a>

## [3.1.0](https://github.com/poppinss/youch/compare/v3.0.0...v3.1.0) (2022-01-16)

### Features

- Add support for ESM stack traces. For ESM the file paths are URLs prefixed with the `file:///`.
- Add support for toggling the "show all frames" checkbox.

<a name="3.0.0"></a>

## [3.0.0](https://github.com/poppinss/youch/compare/v2.2.1...v3.0.0) (2021-12-17)

### Breaking change

- `toJSON` method now returns an array of frames with two addtional properties `callee` and `calleeShort` in place of `method`.

### Features

- Make `request` optional for both HTML and JSON output

### Bug fixes

- Syntax errors are now properly reported.

<a name="2.2.1"></a>

## [2.2.1](https://github.com/poppinss/youch/compare/v2.2.0...v2.2.1) (2021-03-23)

<a name="2.2.0"></a>

## [2.2.0](https://github.com/poppinss/youch/compare/v2.1.1...v2.2.0) (2021-03-21)

<a name="2.1.1"></a>

## [2.1.1](https://github.com/poppinss/youch/compare/v2.1.0...v2.1.1) (2020-10-04)

<a name="2.1.0"></a>

## [2.0.10](https://github.com/poppinss/youch/compare/v2.0.10...v2.1.0) (2020-10-01)

<a name="2.0.10"></a>

## [2.0.10](https://github.com/poppinss/youch/compare/v2.0.9...v2.0.10) (2018-09-29)

### Features

- **links:** add support for font awesome icons and lazy load css files ([1bd258a](https://github.com/poppinss/youch/commit/1bd258a))

<a name="2.0.9"></a>

## [2.0.9](https://github.com/poppinss/youch/compare/v2.0.8...v2.0.9) (2018-08-11)

### Bug Fixes

- **docs:** remove outdated link from Contributing ([#7](https://github.com/poppinss/youch/issues/7)) ([4edf88c](https://github.com/poppinss/youch/commit/4edf88c))
- **frame:** do not crash when filepath does not exist ([#6](https://github.com/poppinss/youch/issues/6)) ([dac572d](https://github.com/poppinss/youch/commit/dac572d))

### Features

- **frame:** handle common Webpack setup ([#8](https://github.com/poppinss/youch/issues/8)) ([896474c](https://github.com/poppinss/youch/commit/896474c))

<a name="2.0.8"></a>

## [2.0.8](https://github.com/poppinss/youch/compare/v2.0.7...v2.0.8) (2018-06-18)

<a name="2.0.7"></a>

## [2.0.7](https://github.com/poppinss/youch/compare/v2.0.6...v2.0.7) (2018-01-10)

### Features

- **frame:** attach isModule and isNative props to frame ([46e8bbe](https://github.com/poppinss/youch/commit/46e8bbe))

<a name="2.0.6"></a>

## [2.0.6](https://github.com/poppinss/youch/compare/v2.0.5...v2.0.6) (2018-01-09)

<a name="2.0.5"></a>

## [2.0.5](https://github.com/poppinss/youch/compare/v2.0.4...v2.0.5) (2017-06-13)

### Bug Fixes

- **template:** improve css for smaller screens ([b07c77d](https://github.com/poppinss/youch/commit/b07c77d))

<a name="2.0.4"></a>

## [2.0.4](https://github.com/poppinss/youch/compare/v2.0.3...v2.0.4) (2017-01-31)

### Bug Fixes

- **test:** use mocha instead of japa ([8bf7039](https://github.com/poppinss/youch/commit/8bf7039))

<a name="2.0.3"></a>

## [2.0.3](https://github.com/poppinss/youch/compare/v2.0.2...v2.0.3) (2017-01-30)

### Bug Fixes

- **regex:** use plain regex over path.sep ([db3e2dc](https://github.com/poppinss/youch/commit/db3e2dc))

<a name="2.0.2"></a>

## [2.0.2](https://github.com/poppinss/youch/compare/v2.0.0...v2.0.2) (2017-01-27)

### Bug Fixes

- **package:** fix path to main file ([5ad3b4a](https://github.com/poppinss/youch/commit/5ad3b4a))

<a name="2.0.1"></a>

## [2.0.1](https://github.com/poppinss/youch/compare/v2.0.0...v2.0.1) (2017-01-26)

### Bug Fixes

- **package:** fix path to main file ([5ad3b4a](https://github.com/poppinss/youch/commit/5ad3b4a))

<a name="2.0.0"></a>

# 2.0.0 (2017-01-26)

### Features

- initial implementation ([aba222a](https://github.com/poppinss/youch/commit/aba222a))
