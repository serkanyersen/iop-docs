grammar Iop

entry File:
    (elements+=Element)*;

// Elements
Element:
    Attribute | Block;

// Attributes: key = value
Attribute:
    name=ID '=' value=Value;

Value:
    StringValue | NumberValue | BooleanValue | ListValue | MapValue;

StringValue:
    value=STRING;

NumberValue:
    value=NUMBER;

BooleanValue:
    value=BOOLEAN;

ListValue:
    '[' elements+=Value (',' elements+=Value)* ']';

MapValue:
    '{' attributes+=Attribute* '}';

// Blocks: type "name" { ... }
Block:
    type=ID labels+=STRING* ('{'
        body+=Element*
    '}')?;

// Terminals
hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;

terminal STRING: /"""[\s\S]*?"""|"[^"]*"/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
terminal BOOLEAN returns boolean: /true|false/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
