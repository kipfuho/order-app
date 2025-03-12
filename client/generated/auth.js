/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.auth = (function() {

    /**
     * Namespace auth.
     * @exports auth
     * @namespace
     */
    var auth = {};

    auth.User = (function() {

        /**
         * Properties of a User.
         * @memberof auth
         * @interface IUser
         * @property {string|null} [name] User name
         * @property {string|null} [email] User email
         */

        /**
         * Constructs a new User.
         * @memberof auth
         * @classdesc Represents a User.
         * @implements IUser
         * @constructor
         * @param {auth.IUser=} [properties] Properties to set
         */
        function User(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User name.
         * @member {string} name
         * @memberof auth.User
         * @instance
         */
        User.prototype.name = "";

        /**
         * User email.
         * @member {string} email
         * @memberof auth.User
         * @instance
         */
        User.prototype.email = "";

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof auth.User
         * @static
         * @param {auth.IUser=} [properties] Properties to set
         * @returns {auth.User} User instance
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link auth.User.verify|verify} messages.
         * @function encode
         * @memberof auth.User
         * @static
         * @param {auth.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.email);
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link auth.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof auth.User
         * @static
         * @param {auth.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof auth.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {auth.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.auth.User();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.email = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof auth.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {auth.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof auth.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.email != null && message.hasOwnProperty("email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof auth.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {auth.User} User
         */
        User.fromObject = function fromObject(object) {
            if (object instanceof $root.auth.User)
                return object;
            var message = new $root.auth.User();
            if (object.name != null)
                message.name = String(object.name);
            if (object.email != null)
                message.email = String(object.email);
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof auth.User
         * @static
         * @param {auth.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.email = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.email != null && message.hasOwnProperty("email"))
                object.email = message.email;
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof auth.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for User
         * @function getTypeUrl
         * @memberof auth.User
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        User.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/auth.User";
        };

        return User;
    })();

    auth.Tokens = (function() {

        /**
         * Properties of a Tokens.
         * @memberof auth
         * @interface ITokens
         * @property {auth.Tokens.IToken|null} [access] Tokens access
         * @property {auth.Tokens.IToken|null} [refresh] Tokens refresh
         */

        /**
         * Constructs a new Tokens.
         * @memberof auth
         * @classdesc Represents a Tokens.
         * @implements ITokens
         * @constructor
         * @param {auth.ITokens=} [properties] Properties to set
         */
        function Tokens(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Tokens access.
         * @member {auth.Tokens.IToken|null|undefined} access
         * @memberof auth.Tokens
         * @instance
         */
        Tokens.prototype.access = null;

        /**
         * Tokens refresh.
         * @member {auth.Tokens.IToken|null|undefined} refresh
         * @memberof auth.Tokens
         * @instance
         */
        Tokens.prototype.refresh = null;

        /**
         * Creates a new Tokens instance using the specified properties.
         * @function create
         * @memberof auth.Tokens
         * @static
         * @param {auth.ITokens=} [properties] Properties to set
         * @returns {auth.Tokens} Tokens instance
         */
        Tokens.create = function create(properties) {
            return new Tokens(properties);
        };

        /**
         * Encodes the specified Tokens message. Does not implicitly {@link auth.Tokens.verify|verify} messages.
         * @function encode
         * @memberof auth.Tokens
         * @static
         * @param {auth.ITokens} message Tokens message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tokens.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.access != null && Object.hasOwnProperty.call(message, "access"))
                $root.auth.Tokens.Token.encode(message.access, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.refresh != null && Object.hasOwnProperty.call(message, "refresh"))
                $root.auth.Tokens.Token.encode(message.refresh, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Tokens message, length delimited. Does not implicitly {@link auth.Tokens.verify|verify} messages.
         * @function encodeDelimited
         * @memberof auth.Tokens
         * @static
         * @param {auth.ITokens} message Tokens message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tokens.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Tokens message from the specified reader or buffer.
         * @function decode
         * @memberof auth.Tokens
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {auth.Tokens} Tokens
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tokens.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.auth.Tokens();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.access = $root.auth.Tokens.Token.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.refresh = $root.auth.Tokens.Token.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Tokens message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof auth.Tokens
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {auth.Tokens} Tokens
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tokens.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Tokens message.
         * @function verify
         * @memberof auth.Tokens
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Tokens.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.access != null && message.hasOwnProperty("access")) {
                var error = $root.auth.Tokens.Token.verify(message.access);
                if (error)
                    return "access." + error;
            }
            if (message.refresh != null && message.hasOwnProperty("refresh")) {
                var error = $root.auth.Tokens.Token.verify(message.refresh);
                if (error)
                    return "refresh." + error;
            }
            return null;
        };

        /**
         * Creates a Tokens message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof auth.Tokens
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {auth.Tokens} Tokens
         */
        Tokens.fromObject = function fromObject(object) {
            if (object instanceof $root.auth.Tokens)
                return object;
            var message = new $root.auth.Tokens();
            if (object.access != null) {
                if (typeof object.access !== "object")
                    throw TypeError(".auth.Tokens.access: object expected");
                message.access = $root.auth.Tokens.Token.fromObject(object.access);
            }
            if (object.refresh != null) {
                if (typeof object.refresh !== "object")
                    throw TypeError(".auth.Tokens.refresh: object expected");
                message.refresh = $root.auth.Tokens.Token.fromObject(object.refresh);
            }
            return message;
        };

        /**
         * Creates a plain object from a Tokens message. Also converts values to other types if specified.
         * @function toObject
         * @memberof auth.Tokens
         * @static
         * @param {auth.Tokens} message Tokens
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Tokens.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.access = null;
                object.refresh = null;
            }
            if (message.access != null && message.hasOwnProperty("access"))
                object.access = $root.auth.Tokens.Token.toObject(message.access, options);
            if (message.refresh != null && message.hasOwnProperty("refresh"))
                object.refresh = $root.auth.Tokens.Token.toObject(message.refresh, options);
            return object;
        };

        /**
         * Converts this Tokens to JSON.
         * @function toJSON
         * @memberof auth.Tokens
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Tokens.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Tokens
         * @function getTypeUrl
         * @memberof auth.Tokens
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Tokens.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/auth.Tokens";
        };

        Tokens.Token = (function() {

            /**
             * Properties of a Token.
             * @memberof auth.Tokens
             * @interface IToken
             * @property {string|null} [token] Token token
             * @property {number|Long|null} [expires] Token expires
             */

            /**
             * Constructs a new Token.
             * @memberof auth.Tokens
             * @classdesc Represents a Token.
             * @implements IToken
             * @constructor
             * @param {auth.Tokens.IToken=} [properties] Properties to set
             */
            function Token(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Token token.
             * @member {string} token
             * @memberof auth.Tokens.Token
             * @instance
             */
            Token.prototype.token = "";

            /**
             * Token expires.
             * @member {number|Long} expires
             * @memberof auth.Tokens.Token
             * @instance
             */
            Token.prototype.expires = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Token instance using the specified properties.
             * @function create
             * @memberof auth.Tokens.Token
             * @static
             * @param {auth.Tokens.IToken=} [properties] Properties to set
             * @returns {auth.Tokens.Token} Token instance
             */
            Token.create = function create(properties) {
                return new Token(properties);
            };

            /**
             * Encodes the specified Token message. Does not implicitly {@link auth.Tokens.Token.verify|verify} messages.
             * @function encode
             * @memberof auth.Tokens.Token
             * @static
             * @param {auth.Tokens.IToken} message Token message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Token.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.token);
                if (message.expires != null && Object.hasOwnProperty.call(message, "expires"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.expires);
                return writer;
            };

            /**
             * Encodes the specified Token message, length delimited. Does not implicitly {@link auth.Tokens.Token.verify|verify} messages.
             * @function encodeDelimited
             * @memberof auth.Tokens.Token
             * @static
             * @param {auth.Tokens.IToken} message Token message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Token.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Token message from the specified reader or buffer.
             * @function decode
             * @memberof auth.Tokens.Token
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {auth.Tokens.Token} Token
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Token.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.auth.Tokens.Token();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.token = reader.string();
                            break;
                        }
                    case 2: {
                            message.expires = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Token message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof auth.Tokens.Token
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {auth.Tokens.Token} Token
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Token.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Token message.
             * @function verify
             * @memberof auth.Tokens.Token
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Token.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.token != null && message.hasOwnProperty("token"))
                    if (!$util.isString(message.token))
                        return "token: string expected";
                if (message.expires != null && message.hasOwnProperty("expires"))
                    if (!$util.isInteger(message.expires) && !(message.expires && $util.isInteger(message.expires.low) && $util.isInteger(message.expires.high)))
                        return "expires: integer|Long expected";
                return null;
            };

            /**
             * Creates a Token message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof auth.Tokens.Token
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {auth.Tokens.Token} Token
             */
            Token.fromObject = function fromObject(object) {
                if (object instanceof $root.auth.Tokens.Token)
                    return object;
                var message = new $root.auth.Tokens.Token();
                if (object.token != null)
                    message.token = String(object.token);
                if (object.expires != null)
                    if ($util.Long)
                        (message.expires = $util.Long.fromValue(object.expires)).unsigned = false;
                    else if (typeof object.expires === "string")
                        message.expires = parseInt(object.expires, 10);
                    else if (typeof object.expires === "number")
                        message.expires = object.expires;
                    else if (typeof object.expires === "object")
                        message.expires = new $util.LongBits(object.expires.low >>> 0, object.expires.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Token message. Also converts values to other types if specified.
             * @function toObject
             * @memberof auth.Tokens.Token
             * @static
             * @param {auth.Tokens.Token} message Token
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Token.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.token = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.expires = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.expires = options.longs === String ? "0" : 0;
                }
                if (message.token != null && message.hasOwnProperty("token"))
                    object.token = message.token;
                if (message.expires != null && message.hasOwnProperty("expires"))
                    if (typeof message.expires === "number")
                        object.expires = options.longs === String ? String(message.expires) : message.expires;
                    else
                        object.expires = options.longs === String ? $util.Long.prototype.toString.call(message.expires) : options.longs === Number ? new $util.LongBits(message.expires.low >>> 0, message.expires.high >>> 0).toNumber() : message.expires;
                return object;
            };

            /**
             * Converts this Token to JSON.
             * @function toJSON
             * @memberof auth.Tokens.Token
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Token.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Token
             * @function getTypeUrl
             * @memberof auth.Tokens.Token
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Token.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/auth.Tokens.Token";
            };

            return Token;
        })();

        return Tokens;
    })();

    auth.LoginRequest = (function() {

        /**
         * Properties of a LoginRequest.
         * @memberof auth
         * @interface ILoginRequest
         * @property {string|null} [email] LoginRequest email
         * @property {string|null} [password] LoginRequest password
         */

        /**
         * Constructs a new LoginRequest.
         * @memberof auth
         * @classdesc Represents a LoginRequest.
         * @implements ILoginRequest
         * @constructor
         * @param {auth.ILoginRequest=} [properties] Properties to set
         */
        function LoginRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginRequest email.
         * @member {string} email
         * @memberof auth.LoginRequest
         * @instance
         */
        LoginRequest.prototype.email = "";

        /**
         * LoginRequest password.
         * @member {string} password
         * @memberof auth.LoginRequest
         * @instance
         */
        LoginRequest.prototype.password = "";

        /**
         * Creates a new LoginRequest instance using the specified properties.
         * @function create
         * @memberof auth.LoginRequest
         * @static
         * @param {auth.ILoginRequest=} [properties] Properties to set
         * @returns {auth.LoginRequest} LoginRequest instance
         */
        LoginRequest.create = function create(properties) {
            return new LoginRequest(properties);
        };

        /**
         * Encodes the specified LoginRequest message. Does not implicitly {@link auth.LoginRequest.verify|verify} messages.
         * @function encode
         * @memberof auth.LoginRequest
         * @static
         * @param {auth.ILoginRequest} message LoginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.email);
            if (message.password != null && Object.hasOwnProperty.call(message, "password"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.password);
            return writer;
        };

        /**
         * Encodes the specified LoginRequest message, length delimited. Does not implicitly {@link auth.LoginRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof auth.LoginRequest
         * @static
         * @param {auth.ILoginRequest} message LoginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginRequest message from the specified reader or buffer.
         * @function decode
         * @memberof auth.LoginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {auth.LoginRequest} LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.auth.LoginRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.email = reader.string();
                        break;
                    }
                case 2: {
                        message.password = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LoginRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof auth.LoginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {auth.LoginRequest} LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginRequest message.
         * @function verify
         * @memberof auth.LoginRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.email != null && message.hasOwnProperty("email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            if (message.password != null && message.hasOwnProperty("password"))
                if (!$util.isString(message.password))
                    return "password: string expected";
            return null;
        };

        /**
         * Creates a LoginRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof auth.LoginRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {auth.LoginRequest} LoginRequest
         */
        LoginRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.auth.LoginRequest)
                return object;
            var message = new $root.auth.LoginRequest();
            if (object.email != null)
                message.email = String(object.email);
            if (object.password != null)
                message.password = String(object.password);
            return message;
        };

        /**
         * Creates a plain object from a LoginRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof auth.LoginRequest
         * @static
         * @param {auth.LoginRequest} message LoginRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LoginRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.email = "";
                object.password = "";
            }
            if (message.email != null && message.hasOwnProperty("email"))
                object.email = message.email;
            if (message.password != null && message.hasOwnProperty("password"))
                object.password = message.password;
            return object;
        };

        /**
         * Converts this LoginRequest to JSON.
         * @function toJSON
         * @memberof auth.LoginRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LoginRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LoginRequest
         * @function getTypeUrl
         * @memberof auth.LoginRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LoginRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/auth.LoginRequest";
        };

        return LoginRequest;
    })();

    auth.LoginResponse = (function() {

        /**
         * Properties of a LoginResponse.
         * @memberof auth
         * @interface ILoginResponse
         * @property {auth.IUser|null} [user] LoginResponse user
         * @property {auth.ITokens|null} [tokens] LoginResponse tokens
         */

        /**
         * Constructs a new LoginResponse.
         * @memberof auth
         * @classdesc Represents a LoginResponse.
         * @implements ILoginResponse
         * @constructor
         * @param {auth.ILoginResponse=} [properties] Properties to set
         */
        function LoginResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginResponse user.
         * @member {auth.IUser|null|undefined} user
         * @memberof auth.LoginResponse
         * @instance
         */
        LoginResponse.prototype.user = null;

        /**
         * LoginResponse tokens.
         * @member {auth.ITokens|null|undefined} tokens
         * @memberof auth.LoginResponse
         * @instance
         */
        LoginResponse.prototype.tokens = null;

        /**
         * Creates a new LoginResponse instance using the specified properties.
         * @function create
         * @memberof auth.LoginResponse
         * @static
         * @param {auth.ILoginResponse=} [properties] Properties to set
         * @returns {auth.LoginResponse} LoginResponse instance
         */
        LoginResponse.create = function create(properties) {
            return new LoginResponse(properties);
        };

        /**
         * Encodes the specified LoginResponse message. Does not implicitly {@link auth.LoginResponse.verify|verify} messages.
         * @function encode
         * @memberof auth.LoginResponse
         * @static
         * @param {auth.ILoginResponse} message LoginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.user != null && Object.hasOwnProperty.call(message, "user"))
                $root.auth.User.encode(message.user, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.tokens != null && Object.hasOwnProperty.call(message, "tokens"))
                $root.auth.Tokens.encode(message.tokens, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified LoginResponse message, length delimited. Does not implicitly {@link auth.LoginResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof auth.LoginResponse
         * @static
         * @param {auth.ILoginResponse} message LoginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginResponse message from the specified reader or buffer.
         * @function decode
         * @memberof auth.LoginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {auth.LoginResponse} LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.auth.LoginResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.user = $root.auth.User.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.tokens = $root.auth.Tokens.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LoginResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof auth.LoginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {auth.LoginResponse} LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginResponse message.
         * @function verify
         * @memberof auth.LoginResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.user != null && message.hasOwnProperty("user")) {
                var error = $root.auth.User.verify(message.user);
                if (error)
                    return "user." + error;
            }
            if (message.tokens != null && message.hasOwnProperty("tokens")) {
                var error = $root.auth.Tokens.verify(message.tokens);
                if (error)
                    return "tokens." + error;
            }
            return null;
        };

        /**
         * Creates a LoginResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof auth.LoginResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {auth.LoginResponse} LoginResponse
         */
        LoginResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.auth.LoginResponse)
                return object;
            var message = new $root.auth.LoginResponse();
            if (object.user != null) {
                if (typeof object.user !== "object")
                    throw TypeError(".auth.LoginResponse.user: object expected");
                message.user = $root.auth.User.fromObject(object.user);
            }
            if (object.tokens != null) {
                if (typeof object.tokens !== "object")
                    throw TypeError(".auth.LoginResponse.tokens: object expected");
                message.tokens = $root.auth.Tokens.fromObject(object.tokens);
            }
            return message;
        };

        /**
         * Creates a plain object from a LoginResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof auth.LoginResponse
         * @static
         * @param {auth.LoginResponse} message LoginResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LoginResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.user = null;
                object.tokens = null;
            }
            if (message.user != null && message.hasOwnProperty("user"))
                object.user = $root.auth.User.toObject(message.user, options);
            if (message.tokens != null && message.hasOwnProperty("tokens"))
                object.tokens = $root.auth.Tokens.toObject(message.tokens, options);
            return object;
        };

        /**
         * Converts this LoginResponse to JSON.
         * @function toJSON
         * @memberof auth.LoginResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LoginResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LoginResponse
         * @function getTypeUrl
         * @memberof auth.LoginResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LoginResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/auth.LoginResponse";
        };

        return LoginResponse;
    })();

    return auth;
})();

module.exports = $root;
