import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { keyValueGrammer } from "./keyvalue.grammer";

export const apiGrammer: LexerGrammer[] = [
  {
    name: "api statement",
    regex:
      /^\s*(Api)(?:\s+(GET|POST|PUT|DELETE|PATCH))?\s+((#)(\S+))(?:\s+(.*))?$/,
    groups: [
      {
        tokenType: TokenType.Api,
        index: 1,
      },
      {
        tokenType: TokenType.ApiMethod,
        index: 2,
      },
      {
        tokenType: TokenType.Hash,
        index: 4,
      },
      {
        tokenType: TokenType.Identifier,
        index: 5,
      },
      {
        tokenType: TokenType.Title,
        index: 6,
      },
    ],
    isOptional: true,
    isMultiline: false,
  },
  {
    name: "url",
    regex: /^\s*(Url)\s+(.*)$/,
    groups: [
      {
        tokenType: TokenType.Url,
        index: 1,
      },
      {
        tokenType: TokenType.Value,
        index: 2,
      },
    ],
    isMultiline: false,
  },
  {
    name: "Header",
    regex: /^\s*(Header)/,
    groups: [
      {
        tokenType: TokenType.Header,
        index: 1,
      },
    ],
    next: [
      {
        ...keyValueGrammer,
        moveNextLine: true,
      },
    ],
    isMultiline: false,
  },
  {
    name: "Body",
    regex: /^\s*(Body)\s(\w+)\s*/,
    groups: [
      {
        tokenType: TokenType.Body,
        index: 1,
      },
      {
        tokenType: TokenType.BodyType,
        index: 2,
      },
    ],
    next: [
      {
        name: "multilineValue",
        regex: /(`)([\s\S]*?)(`)/,
        isOptional: false,
        groups: [
          {
            tokenType: TokenType.Backtick,
            index: 1,
          },
          {
            tokenType: TokenType.Scalar,
            index: 2,
          },
          {
            tokenType: TokenType.Backtick,
            index: 3,
          },
        ],
        start: /(`)([\s\S]*?)/,
        end: /(`)([\s\S]*?)(`)/,
        mergeLines: true,
      },
    ],
  },
];
