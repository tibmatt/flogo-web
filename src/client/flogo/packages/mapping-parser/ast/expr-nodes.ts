/**
 * Ast nodes for expressions.
 * Based on golang's AST classes:
 * https://godoc.org/go/ast
 */
import { Node } from './node';

export type Expr = SelectorExpr | IndexExpr | CallExpr | UnaryExpr | BinaryExpr | Identifier | BasicLit;

export interface ExprStmt {
  type: 'ExprStmt';
  // we call "x" because that's the way golang's AST does it
  x: Expr;
}

export interface BasicLit extends Node {
  type: 'BasicLit';
  kind: string;
  value: any;
  raw: string;
}

export interface Identifier extends Node {
  type: 'Identifier';
  name: string;
}

// a.b.c => (x=expr(a.b); sel='c')
export interface SelectorExpr extends Node {
  type: 'SelectorExpr';
  x: Expr;
  sel: Identifier;
}

// a.b[0] => (x=expr(a.b); index=0)
export interface IndexExpr extends Node {
  type: 'IndexExpr';
  x: Expr;
  index: number;
}

export interface CallExpr extends Node {
  type: 'CallExpr';
  fun: Expr;
  args: Expr[];
}

// flogo specific
// example: $activity[my_act] -> { name: 'activity'; selector: 'my_act' }
// example: $. -> { }
//
export interface ScopeResolver extends Node {
  type: 'ScopeResolver';
  name?: string;
  selector?: string;
}

// !a => (operator="!"; x="a")
export interface UnaryExpr extends Node {
  type: 'UnaryExpr';
  operator: string;
  x: Expr;
}

// a > b => (x="a"; operator=">"; y="b" )
export interface BinaryExpr extends Node {
  type: 'BinaryExpr';
  x: Expr;
  operator: string;
  y: Expr;
}
