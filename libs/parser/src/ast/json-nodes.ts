import { Node } from './node';

import { Expr } from './expr-nodes';
export type ValueNode = ObjectNode | ArrayNode | LiteralNode | StringTemplateNode;

export interface JsonNode extends Node {
  type: 'json';
  value: ObjectNode | ArrayNode;
}

export interface ObjectNode extends Node {
  type: 'jsonObject';
  children: PropertyNode[];
}

export interface ArrayNode extends Node {
  type: 'jsonArray';
  children: ValueNode[];
}

export interface PropertyNode {
  type: 'jsonProperty';
  key: string;
  value: ValueNode;
}

export interface LiteralNode {
  type: 'jsonLiteral';
  value: any;
  kind: string;
  raw: string;
}

export interface StringTemplateNode {
  type: 'stringTemplate';
  expression: Expr;
}

