%{
#include <stdio.h>
%}

%%
"int"|"float"|"char"|"double"|"if"|"else"|"for"|"while"|"return"|"void" {
    printf("Keyword: %s\n",yytext);
}

[a-zA-Z_][a-zA-Z0-9_]* {
    printf("Identifier: %s\n",yytext);
}

[ \t\n]+ ;
. ;
%%

int main() {
    yylex();
}