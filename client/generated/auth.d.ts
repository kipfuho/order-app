import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace auth. */
export namespace auth {

    /** Properties of a User. */
    interface IUser {

        /** User name */
        name?: (string|null);

        /** User email */
        email?: (string|null);
    }

    /** Represents a User. */
    class User implements IUser {

        /**
         * Constructs a new User.
         * @param [properties] Properties to set
         */
        constructor(properties?: auth.IUser);

        /** User name. */
        public name: string;

        /** User email. */
        public email: string;

        /**
         * Creates a new User instance using the specified properties.
         * @param [properties] Properties to set
         * @returns User instance
         */
        public static create(properties?: auth.IUser): auth.User;

        /**
         * Encodes the specified User message. Does not implicitly {@link auth.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: auth.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link auth.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: auth.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a User message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): auth.User;

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): auth.User;

        /**
         * Verifies a User message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns User
         */
        public static fromObject(object: { [k: string]: any }): auth.User;

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @param message User
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: auth.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this User to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for User
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Tokens. */
    interface ITokens {

        /** Tokens access */
        access?: (auth.Tokens.IToken|null);

        /** Tokens refresh */
        refresh?: (auth.Tokens.IToken|null);
    }

    /** Represents a Tokens. */
    class Tokens implements ITokens {

        /**
         * Constructs a new Tokens.
         * @param [properties] Properties to set
         */
        constructor(properties?: auth.ITokens);

        /** Tokens access. */
        public access?: (auth.Tokens.IToken|null);

        /** Tokens refresh. */
        public refresh?: (auth.Tokens.IToken|null);

        /**
         * Creates a new Tokens instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Tokens instance
         */
        public static create(properties?: auth.ITokens): auth.Tokens;

        /**
         * Encodes the specified Tokens message. Does not implicitly {@link auth.Tokens.verify|verify} messages.
         * @param message Tokens message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: auth.ITokens, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Tokens message, length delimited. Does not implicitly {@link auth.Tokens.verify|verify} messages.
         * @param message Tokens message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: auth.ITokens, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Tokens message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Tokens
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): auth.Tokens;

        /**
         * Decodes a Tokens message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Tokens
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): auth.Tokens;

        /**
         * Verifies a Tokens message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Tokens message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Tokens
         */
        public static fromObject(object: { [k: string]: any }): auth.Tokens;

        /**
         * Creates a plain object from a Tokens message. Also converts values to other types if specified.
         * @param message Tokens
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: auth.Tokens, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Tokens to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Tokens
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace Tokens {

        /** Properties of a Token. */
        interface IToken {

            /** Token token */
            token?: (string|null);

            /** Token expires */
            expires?: (number|Long|null);
        }

        /** Represents a Token. */
        class Token implements IToken {

            /**
             * Constructs a new Token.
             * @param [properties] Properties to set
             */
            constructor(properties?: auth.Tokens.IToken);

            /** Token token. */
            public token: string;

            /** Token expires. */
            public expires: (number|Long);

            /**
             * Creates a new Token instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Token instance
             */
            public static create(properties?: auth.Tokens.IToken): auth.Tokens.Token;

            /**
             * Encodes the specified Token message. Does not implicitly {@link auth.Tokens.Token.verify|verify} messages.
             * @param message Token message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: auth.Tokens.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Token message, length delimited. Does not implicitly {@link auth.Tokens.Token.verify|verify} messages.
             * @param message Token message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: auth.Tokens.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Token message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Token
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): auth.Tokens.Token;

            /**
             * Decodes a Token message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Token
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): auth.Tokens.Token;

            /**
             * Verifies a Token message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Token message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Token
             */
            public static fromObject(object: { [k: string]: any }): auth.Tokens.Token;

            /**
             * Creates a plain object from a Token message. Also converts values to other types if specified.
             * @param message Token
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: auth.Tokens.Token, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Token to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Token
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a LoginRequest. */
    interface ILoginRequest {

        /** LoginRequest email */
        email?: (string|null);

        /** LoginRequest password */
        password?: (string|null);
    }

    /** Represents a LoginRequest. */
    class LoginRequest implements ILoginRequest {

        /**
         * Constructs a new LoginRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: auth.ILoginRequest);

        /** LoginRequest email. */
        public email: string;

        /** LoginRequest password. */
        public password: string;

        /**
         * Creates a new LoginRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LoginRequest instance
         */
        public static create(properties?: auth.ILoginRequest): auth.LoginRequest;

        /**
         * Encodes the specified LoginRequest message. Does not implicitly {@link auth.LoginRequest.verify|verify} messages.
         * @param message LoginRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: auth.ILoginRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LoginRequest message, length delimited. Does not implicitly {@link auth.LoginRequest.verify|verify} messages.
         * @param message LoginRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: auth.ILoginRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LoginRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): auth.LoginRequest;

        /**
         * Decodes a LoginRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): auth.LoginRequest;

        /**
         * Verifies a LoginRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LoginRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LoginRequest
         */
        public static fromObject(object: { [k: string]: any }): auth.LoginRequest;

        /**
         * Creates a plain object from a LoginRequest message. Also converts values to other types if specified.
         * @param message LoginRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: auth.LoginRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LoginRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for LoginRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a LoginResponse. */
    interface ILoginResponse {

        /** LoginResponse user */
        user?: (auth.IUser|null);

        /** LoginResponse tokens */
        tokens?: (auth.ITokens|null);
    }

    /** Represents a LoginResponse. */
    class LoginResponse implements ILoginResponse {

        /**
         * Constructs a new LoginResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: auth.ILoginResponse);

        /** LoginResponse user. */
        public user?: (auth.IUser|null);

        /** LoginResponse tokens. */
        public tokens?: (auth.ITokens|null);

        /**
         * Creates a new LoginResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LoginResponse instance
         */
        public static create(properties?: auth.ILoginResponse): auth.LoginResponse;

        /**
         * Encodes the specified LoginResponse message. Does not implicitly {@link auth.LoginResponse.verify|verify} messages.
         * @param message LoginResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: auth.ILoginResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LoginResponse message, length delimited. Does not implicitly {@link auth.LoginResponse.verify|verify} messages.
         * @param message LoginResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: auth.ILoginResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LoginResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): auth.LoginResponse;

        /**
         * Decodes a LoginResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): auth.LoginResponse;

        /**
         * Verifies a LoginResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LoginResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LoginResponse
         */
        public static fromObject(object: { [k: string]: any }): auth.LoginResponse;

        /**
         * Creates a plain object from a LoginResponse message. Also converts values to other types if specified.
         * @param message LoginResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: auth.LoginResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LoginResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for LoginResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
